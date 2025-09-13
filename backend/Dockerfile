FROM golang:1.25-alpine


# Set the working directory (this is /backend in HackMIT)
WORKDIR /app

# Copy only go.mod and go.sum first (to cache dependencies)
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire project
COPY . .

WORKDIR /app/cmd 
RUN go build -o main main.go

CMD ["./main"]
