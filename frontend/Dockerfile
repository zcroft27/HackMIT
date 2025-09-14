FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Remove Next.js specific env vars and build step
# Create React App builds are typically handled differently

EXPOSE 3000
CMD ["npm", "start"]  # This runs the dev server