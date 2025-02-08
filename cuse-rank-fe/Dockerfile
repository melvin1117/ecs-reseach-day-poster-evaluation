# Use Node.js base image
FROM node:18.20.6

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the full project into the container
COPY . .

# Expose Angular's default port
EXPOSE 4200

# Start Angular development server
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
