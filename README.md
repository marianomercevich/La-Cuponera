# La Cuponera

## Descripción general de la API:
La Cuponera es una plataforma que conecta a los usuarios con las empresas para ofrecer y utilizar cupones de descuento. La API proporciona endpoints para la gestión de cuponeros (usuarios), cuponizadores (empresas) y cupones, así como funciones de geolocalización para encontrar cupones cercanos a la ubicación del usuario.

## Dependencias:
- Node.js
- Express.js
- MongoDB
- Mongoose

## Endpoints:

### Cuponeros:
- **GET /cuponeros**: Obtiene la información de todos los cuponeros registrados.
- **POST /cuponeros**: Registra un nuevo cuponero.
- **GET /cuponeros/:id**: Obtiene la información de un cuponero específico.
- **PUT /cuponeros/:id**: Actualiza la información de un cuponero existente.
- **DELETE /cuponeros/:id**: Elimina un cuponero.

### Empresas:
- **GET /empresas**: Obtiene la información de todas las empresas registradas.
- **POST /empresas**: Registra una nueva empresa.
- **GET /empresas/:id**: Obtiene la información de una empresa específica.
- **PUT /empresas/:id**: Actualiza la información de una empresa existente.
- **DELETE /empresas/:id**: Elimina una empresa.

### Cupones:
- **GET /cupones**: Obtiene la lista de todos los cupones disponibles.
- **POST /cupones**: Crea un nuevo cupón.
- **GET /cupones/:id**: Obtiene la información de un cupón específico.
- **PUT /cupones/:id**: Actualiza la información de un cupón existente.
- **DELETE /cupones/:id**: Elimina un cupón.
## Dependencias:
- Node.js
- Express.js
- MongoDB
- Mongoose

## Endpoints:

### Cuponeros:
- **GET api/cuponeros**: Obtiene la información de todos los cuponeros registrados.
- **POST api/cuponeros**: Registra un nuevo cuponero.
- **GET api/cuponeros/:id**: Obtiene la información de un cuponero específico.
- **PUT api/cuponeros/:id**: Actualiza la información de un cuponero existente.
- **DELETE api/cuponeros/:id**: Elimina un cuponero.
- **DOCUMENTACION /api/docs** : Obtiene documentacion via Swagger.

### Cuponizadores:
- **GET /cuponizadores**: Obtiene la información de todas las empresas registradas.
- **POST /cuponizadores**: Registra una nueva empresa.
- **GET /cuponizadores/:id**: Obtiene la información de una empresa específica.
- **PUT /cuponizadores/:id**: Actualiza la información de una empresa existente.
- **DELETE /cuponizadores/:id**: Elimina una empresa.

### Cupones:
- **GET /cupones**: Obtiene la lista de todos los cupones disponibles.
- **POST /cupones**: Crea un nuevo cupón.
- **GET /cupones/:id**: Obtiene la información de un cupón específico.
- **PUT /cupones/:id**: Actualiza la información de un cupón existente.
- **DELETE /cupones/:id**: Elimina un cupón.

## Parámetros de solicitud:
- Para los endpoints de creación y actualización, se esperan datos en formato JSON en el cuerpo de la solicitud.
## Pagos

## Parámetros de solicitud:
- Para los endpoints de creación y actualización, se esperan datos en formato JSON en el cuerpo de la solicitud.

## Respuestas de la API:
- La API devuelve respuestas en formato JSON.
- Códigos de estado HTTP comunes incluyen 200 para solicitudes exitosas, 400 para solicitudes incorrectas y 500 para errores internos del servidor.
## Respuestas de la API:
- La API devuelve respuestas en formato JSON.
- Códigos de estado HTTP comunes incluyen 200 para solicitudes exitosas, 400 para solicitudes incorrectas y 500 para errores internos del servidor.

## Ejemplos de uso:
- Para obtener todos los cuponeros:

                    Respuesta:
                    ```json
                    [
                    {
                        "id": 1,
                        "nombre": "Cuponero1",
                        "email": "cuponero1@example.com"
                    },
                    {
                        "id": 2,
                        "nombre": "Cuponero2",
                        "email": "cuponero2@example.com"
                    }
                    ]

## Autenticación y autorización:
- Los usuarios pueden autenticarse mediante un token JWT que se envía en el encabezado de autorización.
- Algunos endpoints, como la creación y actualización de cupones, pueden requerir roles específicos para acceder.
## Ejemplos de uso:
- Para obtener todos los cuponeros:

                    Respuesta:
                    ```json
                    [
                    {
                        "id": 1,
                        "nombre": "Usuario1",
                        "email": "cuponero1@example.com"
                    },
                    {
                        "id": 2,
                        "nombre": "Usuario2",
                        "email": "cuponero2@example.com"
                    }
                    ]

## Autenticación y autorización:
- Los usuarios pueden autenticarse mediante un token JWT que se envía en el encabezado de autorización.
- Algunos endpoints, como la creación y actualización de cupones, pueden requerir roles específicos para acceder.

## Errores y manejo de excepciones:
- La API devuelve mensajes de error descriptivos en caso de solicitudes incorrectas o errores del servidor.
- Los clientes deben manejar los errores y mostrar mensajes informativos al usuario.
## Errores y manejo de excepciones:
- La API devuelve mensajes de error descriptivos en caso de solicitudes incorrectas o errores del servidor.
- Los clientes deben manejar los errores y mostrar mensajes informativos al usuario.

## Seguridad:
- La API utiliza medidas de seguridad como la validación de datos de entrada para prevenir ataques de inyección y autenticación de usuarios para proteger la información sensible.
## Seguridad:
- La API utiliza medidas de seguridad como la validación de datos de entrada para prevenir ataques de inyección y autenticación de usuarios para proteger la información sensible.

## Ejemplos de código:

                Pfetch('https://api.lacuponera.com/cuponeros')
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));

## Herramientas de prueba:
# Swagger
# postman
# thunder client
## Ejemplos de código:

                Pfetch('https://api.lacuponera.com/cuponeros')
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));

## Herramientas de prueba:
# Swagger 
# postman
# thunder client

## Testeos