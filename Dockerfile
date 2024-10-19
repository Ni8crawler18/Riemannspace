# Use a Node.js base image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for npm install
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose ports for the two servers
EXPOSE 3000
EXPOSE 3001

# Start both servers
CMD ["sh", "-c", "node server/index.js & node server/zkIndex.js"]

