# Running Locally
Prerequisites:

- [Node >= v22](https://nodejs.org/en/download) (npm is included)
- [nvm](https://github.com/nvm-sh/nvm) (optional, for managing Node versions on your machine)
- Docker Engine

With node installed, run the following in your terminal:
```
docker compose up --build --watch
```
and open [http://localhost:3000](http://localhost:3000) in your browser. 

> [!NOTE]
> To individually run the backend or frontend, run the following:
> ```
> docker compose up backend --build --watch 
> ```
> Or
> ```
> docker compose up frontend --build --watch
> ```

