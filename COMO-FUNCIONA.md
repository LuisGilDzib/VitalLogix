# COMO FUNCIONA VitalLogix (Sin tecnicismos pesados)

Este documento es para personas junior, estudiantes o cualquier persona curiosa.
La idea no es memorizar código: la idea es entender el flujo de la informacion.

## 1) La Gran Imagen

Imagina una mensajeria:

- Frontend (React): es la ventanilla donde alguien entrega un paquete.
- Backend (Spring Boot): es el centro logistico que revisa reglas y decide que hacer.
- Base de datos (PostgreSQL): es el archivo central donde queda guardado el historial.

En VitalLogix pasa algo parecido:

- En la pantalla haces una accion (por ejemplo, vender un medicamento).
- El servidor valida si la accion es correcta.
- Si todo esta bien, guarda cambios en la base de datos.
- Luego responde al frontend para que te muestre el resultado.

## 2) El Camino de una Venta (Flujo principal)

Cuando una persona hace clic en "Vender", ocurre esto:

1. Peticion (Request)
- El frontend envia un JSON al backend con informacion como producto, cantidad y cliente.

2. Validacion de negocio
- Spring Boot revisa reglas importantes:
- Existe el producto.
- Hay stock suficiente.
- Los datos obligatorios de la venta estan completos.

3. Persistencia
- Si todo es valido, el backend le pide a PostgreSQL:
- Descontar stock del medicamento.
- Crear el registro de la venta.
- Guardar datos de cliente e historial.

4. Respuesta (Response)
- El backend responde con exito o error.
- El frontend muestra confirmacion y, si aplica, el ticket/resultado final.

## 3) El Lenguaje de las Entidades (Los actores)

Piensa en estas tablas/modelos como actores del sistema:

- Medicamento: el protagonista. Tiene nombre, precio, stock, categoria y fecha de vencimiento.
- Venta: el evento principal. Registra que se vendio, cuando y por cuanto.
- Cliente: persona asociada a ventas e historial. Incluye su numero de clienteamigo.
- Categoria: organiza los productos para buscar, filtrar y administrar mejor.

Relaciones simples:

- Una venta puede incluir uno o varios medicamentos.
- Un cliente puede tener muchas ventas a lo largo del tiempo.
- Un medicamento pertenece a una categoria.

## 4) Tecnologias y por que se usan

No es solo "que usamos", sino "para que sirve":

- Java + Spring Boot
- Es el cerebro del sistema.
- Aplica reglas de negocio y expone endpoints seguros para el frontend.

- PostgreSQL
- Es la memoria confiable del proyecto.
- Guarda datos relacionales (clientes, ventas, productos, categorias) con consistencia.

- React
- Es la cara del sistema.
- Permite una experiencia fluida para buscar productos, vender y administrar.

## 5) Un ejemplo rapido de extremo a extremo

Caso: vender 1 unidad de un medicamento.

1. En la UI eliges producto y cantidad.
2. React envia la solicitud al backend.
3. El backend valida stock y reglas.
4. PostgreSQL guarda la venta y actualiza inventario.
5. El backend responde "ok".
6. La UI muestra confirmacion y datos de la venta.

Ese ciclo se repite para casi todo: crear clientes, aprobar categorias, generar reportes, etc.

## 6) Glosario para principiantes

- API
- La puerta de comunicacion entre frontend y backend. El frontend "pregunta" y la API "responde".

- Endpoint
- Una direccion especifica dentro de la API para hacer una accion concreta.

- JSON
- Formato de texto para enviar datos entre sistemas.

- Query
- Consulta a la base de datos para leer o modificar informacion.

- Estado (State) en frontend
- Informacion temporal que React usa para pintar la pantalla (listas, formularios, modales, etc).

- Validacion
- Reglas que impiden guardar datos invalidos (por ejemplo, vender sin stock).

- Persistencia
- Guardar informacion de forma permanente en la base de datos.

## 7) Como leer el proyecto sin perderte

Ruta recomendada para alguien junior:

1. Mira primero la pantalla (frontend) para entender que acciones existen.
2. Identifica que llamada API hace esa accion.
3. Revisa el controlador/servicio del backend que recibe esa llamada.
4. Sigue hasta el repositorio/modelo para ver que se guarda en PostgreSQL.

Si sigues ese camino, el proyecto deja de verse grande y empieza a verse logico.

## 8) Mensaje final

No necesitas entender todo en un dia.
Entender el flujo de datos ya te pone por delante de muchos.
Cuando dominas el flujo, el codigo deja de dar miedo.
