# Maximus De Florenzo Nongsina - Node Wave Backend Test

## Tech Stacks 

- Language : TypeScript 
- ORM : Prisma 
- Database : MySQL
- HTTP Framework : Express 
- Logging : Winston + Morgan

> [!NOTE]  
>  As stated in Getting Started parts of our notion, don't forget to make sure that you have Node.js >= 16.14.2 and MySQL >= 8.0.3

```powershell
npm install
```
> [!IMPORTANT]  
Don't change .env value and db connection url in .env

Run prisma db migration with :

```powershell
npx prisma migrate
```

> [!IMPORTANT]  
> There's dummy data already on database to support this codebase.

## Running The App 
By Default, to run the app with hot-reload simply run 
```
npm run dev -- --service=rest
```

If you want to start the build version, run it with : 
```
npm start -- --service=rest
```

### Postman Collection
[API Endpoint](https://documenter.getpostman.com/view/26937832/2sB2j68VQk)

### List of features / endpoint
#### Authauthentication
- `/auth/register` 
  ```
  POST http://localhost:3010/auth/register
  ```

  **Body Parameters (JSON)**
  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```

  ```js
  router.use("/auth", RoutesRegistry.AuthRoutes)
  AuthRoutes.post("/register", AuthController.register)
  ```

- `/auth/login` 
  ```
  POST http://localhost:3010/auth/login
  ```

  **Body Parameters (JSON)**
  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```

  ```js
  router.use("/auth", RoutesRegistry.AuthRoutes)
  AuthRoutes.post("/login", AuthController.login)

#### Upload File (Excel) 
- `/file/upload` 
  ```
  POST http://localhost:3010/file/upload?module={module}
  ```

  **Body Parameters (form-data)**
  | Field Name     | Type        | Required | Description                              |
  |----------------|-------------|----------|------------------------------------------|
  | `file`         | File        | Yes      | File to be uploaded                      |


  *The module here functions as a marker for which part of Excel it is, this is used to make filtering easier in the future, and it is expected that each module has the same field structure.*

  **Query Parameters**
  ```json
  {
    "module": "hotel"
  }
  ```

  ```js
  router.use("/file", RoutesRegistry.FileRoutes)
  FileRoutes.post("/upload", AuthMiddleware.authMiddleware, uploadMiddleware.single("file"), FileController.upload)
  ```

- `/file/get` 
  ```
  GET http://localhost:3010/file/get
  ```

  *The module here functions as a marker for which part of Excel it is, this is used to make filtering easier in the future, and it is expected that each module has the same field structure.*

  ##### Filter
  You can search for filters for more than 1 data, for example
  ```
  GET http://localhost:3010/file/get?module=HOTEL&filters={"Qty Adult":[2, 3]}
  ```
  In the example above we are looking for Qty Adult with data 2 and 3, for another example
  ```
  GET http://localhost:3010/file/get?module=HOTEL&filters={"Qty Adult":[2]}
  GET http://localhost:3010/file/get?module=HOTEL&filters={"Qty Adult":2}
  ```
  To select only 1 filter you can use Array [] or not use an array.
  
  ##### searchFilters
  In this type of filter, you can search for data that contains the value you want to find, for example
  ```
  GET http://localhost:3010/file/get?module=HOTEL&searchFilters={"Item":"A"}
  ```

  ##### rangeFilters
  Range filter contains filters that take data from a given time range, for example
  ```
  GET http://localhost:3010/file/get?module=HOTEL&rangedFilters=[{"key":"Price Adult","start":10,"end":100}]
  ```

  #### Order By
  To use order by, request must have *orderRule* and *orderKey*, *orderKey* is the key of the item you want order and *orderRule* is ascending or descending
  ```
  GET http://localhost:3010/file/get?module=HOTEL&orderRule=desc&orderKey=Item
  ```

  **Query Parameters (JSON)**
  ```json
  {
    "module": "hotel",
    "filters": {
      "Qty Adult": ["2", "3"]
    },
    "searchFilters": {
      "Item": "A"
    },
    "rangedFilters": {
      "Price Adult": {
        "start": 10,
        "end": 100
      }
    },
    "orderRule": "desc",
    "orderKey": "Item",
    "page": 1,
    "perPage": 20
  }
  ```

  ```js
  router.use("/file", RoutesRegistry.FileRoutes)
  FileRoutes.get("/get", AuthMiddleware.authMiddleware, FileController.get)
  ```