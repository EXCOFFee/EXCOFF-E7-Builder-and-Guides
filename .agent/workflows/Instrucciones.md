---
description: Cosas que debes hacer SIEMPRE
---

1.Nunca uses npm , usa pnpm

2. Siempre que tehaga un prompt arma un plan de implementacion , analiza exhautivamente el proyecto al 100% para no perder nada de contexto y evitar errores o arruinar las cosas que ya funcionan, y si hay sugerencias, opciones y preguntas para mayor eficiencia hacermelas, No asumas reglas. Si las documentaciones no especifica qué pasa en un caso borde (ej: "¿Qué pasa si borro un servicio con turnos activos?"), DETENTE y PREGÚNTAME Dame las opciones y recomendaciones. No inventes la solución "más fácil".

3.Si no estas seguro de algo no inventes cosas o improvises , paras y me consultas , presentame todas las opciones para cada caso y me das tus sugerencias o recomendaciones
    

4.  PARANOIA EN LA VALIDACIÓN:
    Asume que el usuario final intentará romper el sistema.
    - Frontend: Valida tipos y formatos antes de enviar.
    - Backend: Jamás confíes en el Frontend. Valida nuevamente en el servidor (Form Requests/DTOs).
    - Base de Datos: Usa claves foráneas y restricciones a nivel de SQL.


5.  MANEJO DE ERRORES ROBUSTO:
    El "Happy Path" es fácil. Quiero ver cómo manejas el error.
    - Si falla la API, la App no debe crashear (pantalla blanca). Debe mostrar un Toast/Alerta y permitir reintentar.
    - Si falla la BD, el Backend debe loguear el error real internamente pero devolver un mensaje genérico seguro al cliente.

6. Siempre asegurate de actulizar tus datos sobre como procedder stacks tecnologico e informacion de la actualidad (enero 2026 o las fechas mas cercana a esas) 

7.que los planes de implementacion esten en español