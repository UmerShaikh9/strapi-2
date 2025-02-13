# Use the official Node.js image with Bullseye
FROM node:20-bullseye

# Install dependencies for sharp (used in Strapi)
RUN apt-get update && apt-get install -y \
    build-essential \
    libvips-dev \
    python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /opt/app

# Copy only package.json and package-lock.json to install dependencies first
COPY package.json package-lock.json ./

# Install dependencies (including sharp for Strapi)
RUN npm install --include=optional

# Copy the rest of the application code
COPY . .

# Add npm binary path to PATH
ENV PATH=/opt/app/node_modules/.bin:$PATH

# Set permissions and user
RUN chown -R node:node /opt/app
USER node

# Expose the Strapi port
EXPOSE 1337

# Command to build and start the application in production
CMD ["npm", "run", "develop"]
