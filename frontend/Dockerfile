FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Expose port
EXPOSE 3000

# Serve the built app (not run build command)
CMD ["npx", "serve", "-s", "build", "-l", "3000"]