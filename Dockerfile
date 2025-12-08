# Step 1 — Build the Vite project
FROM node:latest AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the full project
COPY . .

# Build Vite
RUN npm run build


# Step 2 — Run the built project using a static server
FROM node:latest AS production

WORKDIR /app

# Install serve (to run dist folder)
RUN npm install -g serve

# Copy only the build output
COPY --from=build /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]
