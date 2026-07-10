# Use the official lightweight Node.js Alpine base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only necessary production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Expose the default port (Back4app will map process.env.PORT to this port)
EXPOSE 5000

# Set production environment flag
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
