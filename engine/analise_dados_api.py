# ==============================================================================
# API FLASK + NGROK + PRIORIDADE MANUAL + RESILIÊNCIA
# ==============================================================================

print("1. Instalando bibliotecas do Servidor...")
!pip install -q Flask flask-cors pyngrok pandas scikit-learn google-generativeai

from flask import Flask, request, jsonify
from flask_cors import CORS
from pyngrok import ngrok
import pandas as pd
import numpy as np
import google.generativeai as genai
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# CONFIGURAÇÃO DO GEMINI
CHAVE_API = "AIzaSyCM2BulmitOoo3SKGdEItp2jK6NkvnkqlM"
genai.configure(api_key=CHAVE_API)
modelo_gemini = genai.GenerativeModel("gemini-1.5-flash")

# =====================================================================
print("2. Treinando a Inteligência Artificial...")

# Banco de dados com Origem (Manual = Estoque Real, Sistema = Aleatório)
dados_mock = pd.DataFrame([
    {'idade': 25, 'renda': 3000, 'profissao_texto': 'Estudante', 'cat_target': 'Hatch', 'Marca': 'Volkswagen', 'Modelo_Geracao': 'Polo', 'Ano': 2022, 'FIPE': 'R$ 70.000,00', 'Imagem': 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800', 'Origem': 'Manual'},
    {'idade': 20, 'renda': 2500, 'profissao_texto': 'Estudante', 'cat_target': 'Hatch', 'Marca': 'Fiat', 'Modelo_Geracao': 'Mobi', 'Ano': 2021, 'FIPE': 'R$ 45.000,00', 'Imagem': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800', 'Origem': 'Sistema'},
    {'idade': 45, 'renda': 15000, 'profissao_texto': 'Médico', 'cat_target': 'SUV', 'Marca': 'Jeep', 'Modelo_Geracao': 'Compass', 'Ano': 2024, 'FIPE': 'R$ 180.000,00', 'Imagem': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 'Origem': 'Manual'},
    {'idade': 35, 'renda': 8000, 'profissao_texto': 'Engenheiro', 'cat_target': 'Sedan', 'Marca': 'Honda', 'Modelo_Geracao': 'Civic', 'Ano': 2023, 'FIPE': 'R$ 120.000,00', 'Imagem': 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800', 'Origem': 'Manual'}
])

preprocessor = ColumnTransformer([('num', StandardScaler(), ['idade', 'renda']), ('texto', TfidfVectorizer(), 'profissao_texto')])
X = dados_mock[['idade', 'renda', 'profissao_texto']]
y = dados_mock['cat_target']
X_raw = preprocessor.fit_transform(X)
X_processed = X_raw.toarray() if hasattr(X_raw, 'toarray') else X_raw
le_y = LabelEncoder()
y_encoded = le_y.fit_transform(y)
rf_model = RandomForestClassifier(random_state=42).fit(X_processed, y_encoded)

# =====================================================================
app = Flask(__name__)
CORS(app)

@app.route('/api/recomendar', methods=['POST'])
def recomendar_carro():
    dados_cliente = request.json
    idade = dados_cliente.get('idade', 30)
    renda = dados_cliente.get('renda', 5000)
    profissao = dados_cliente.get('profissao', 'Outros')

    cliente_raw = preprocessor.transform(pd.DataFrame([{'idade': idade, 'renda': renda, 'profissao_texto': profissao}]))
    cliente_p = cliente_raw.toarray() if hasattr(cliente_raw, 'toarray') else cliente_raw
    pred_cat = le_y.inverse_transform([rf_model.predict(cliente_p)[0]])[0]

    # 🎯 LÓGICA DE PRIORIDADE:
    # 1. Filtramos pela categoria recomendada
    # 2. Ordenamos para que 'Manual' apareça antes de 'Sistema'
    # 3. Pegamos o primeiro resultado dessa lista ordenada
    rec_filtrada = dados_mock[dados_mock['cat_target'] == pred_cat].copy()
    rec_filtrada['Peso_Prioridade'] = np.where(rec_filtrada['Origem'] == 'Manual', 0, 1)
    carro_ideal = rec_filtrada.sort_values(by='Peso_Prioridade').iloc[0]

    prompt = f"Venda um {carro_ideal['Marca']} {carro_ideal['Modelo_Geracao']} para um {profissao} de {idade} anos que ganha R${renda}."
    try: pitch = modelo_gemini.generate_content(prompt).text
    except: pitch = "✨ Veículo selecionado com prioridade pelo nosso estoque físico."

    return jsonify({
        "sucesso": True,
        "recomendacao": {
            "marca": carro_ideal['Marca'], "modelo": carro_ideal['Modelo_Geracao'],
            "ano": int(carro_ideal['Ano']), "categoria": pred_cat,
            "preco_fipe": carro_ideal['FIPE'], "imagem": carro_ideal['Imagem'],
            "argumento_vendas": pitch.strip(), "estoque_real": bool(carro_ideal['Origem'] == 'Manual')
        }
    })

# 🔥 LIGUE O NGROK AQUI (Use seu token)
NGROK_AUTH_TOKEN = ""
ngrok.set_auth_token(NGROK_AUTH_TOKEN)
public_url = ngrok.connect(5000).public_url
print(f"\n✅ API ONLINE: {public_url}")
app.run(port=5000)
