# alpine é uma imagem leve do Linux 
FROM node:24.11.1-alpine AS builder

LABEL maintainer="Squad 10- Residência3"

# Etapa de build 
# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de configuração do projeto para o diretório de trabalho
COPY package*.json ./

# Instala as dependências do projeto, omitindo as dependências de desenvolvimento
RUN npm install
COPY . .
RUN npm run build

# Etapa final 

FROM node:24.11.1-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Copia o código-fonte do projeto para o diretório de trabalho
# copie apenas o resultado do build daquela etapa
COPY --from=builder /app/dist ./dist 

# rodar como usuário não privilegiado (root)
USER node

# Define o comando para iniciar a aplicação quando o container for executado
CMD ["node", "dist/main.js"]

# Porta que a aplicação irá rodar mas por ser Studio ainda, a aplicação não tem uma porta definida
#EXPOSE 3000