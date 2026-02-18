# Memoria del Proyecto: Creación de un LLM de Cocina Desde Cero

## 1. Introducción
Este proyecto tiene como objetivo la **creación real de un Modelo de Lenguaje Grande (LLM)** especializado en cocina, partiendo absolutamente desde cero. A diferencia del "Fine-Tuning" (donde se ajusta un modelo ya existente como Llama o GPT), aquí hemos construido la arquitectura de la red neuronal vacía y le hemos enseñado a hablar y cocinar usando únicamente nuestro propio dataset.

## 2. Metodología "From Scratch" (Desde Cero)
Para cumplir con el requisito de no usar modelos base pre-entrenados, hemos seguido estos pasos:

1.  **Definición de Arquitectura**: Hemos diseñado un "Mini-GPT" con la siguiente configuración:
    - **Capas (Layers)**: 6 (un modelo gigante tiene 32 o más).
    - **Cabezas de Atención (Heads)**: 8.
    - **Dimensión de Embeddings**: 512.
    - **Parámetros Totales**: Aprox. 20-30 millones.
    - **Inicialización**: Aleatoria (`Random Weights`). El modelo nació sin saber nada, ni siquiera qué es una letra.

2.  **Dataset Generativo**:
    - Como un modelo desde cero necesita muchos datos para aprender patrones básicos, hemos creado un **generador sintético** (`generate_dataset.py`).
    - Este script ha producido **5,000 recetas únicas**, combinando ingredientes, técnicas y estilos de respuesta culinaria.
    - Archivo: `recetas_extended.jsonl`.

3.  **Entrenamiento**:
    - Script: `train_from_scratch.py`.
    - Hemos sometido al modelo a **100 ciclos completos (épocas)** sobre el dataset.
    - Durante este proceso, el modelo aprendió primero la estructura del lenguaje (sujeto, verbo, predicado) y luego la lógica culinaria (ingredientes -> receta).

## 3. Estructura del Proyecto
La carpeta `practica_creacion_llm` contiene todo lo necesario:

- **`generate_dataset.py`**: El "creador" de los datos.
- **`recetas_extended.jsonl`**: El libro de cocina con 5,000 ejemplos.
- **`train_from_scratch.py`**: El "gimnasio" donde se entrena el modelo.
- **`chef-bot-scratch-final/`**: La carpeta con el modelo entrenado (pesos `.safetensors` y configuración).
- **`inference_scratch.py`**: El script para probarlo.

## 6. Descripción Detallada de Archivos

A continuación, se detalla el propósito de cada archivo entregado:

1.  **`generate_dataset.py`**:
    *   **Qué es**: Un script de Python que genera datos sintéticos.
    *   **Para qué sirve**: Como no teníamos un dataset gigante a mano, este código "inventa" combinaciones de ingredientes y escribe recetas con un estilo consistente. Es la base del conocimiento del modelo.

2.  **`recetas_extended.jsonl`**:
    *   **Qué es**: El archivo de texto (en formato JSON Lines) que contiene las 5,000 recetas generadas.
    *   **Para qué sirve**: Es el "libro de texto" que el modelo estudia durante el entrenamiento. Cada línea es un ejemplo de `Instrucción -> Respuesta`.

3.  **`train_from_scratch.py`**:
    *   **Qué es**: El script principal de entrenamiento.
    *   **Para qué sirve**:
        *   Define la arquitectura del modelo (Mini-GPT).
        *   Inicializa el modelo con pesos aleatorios (cerebro vacío).
        *   Carga el dataset y ejecuta el bucle de entrenamiento (Backpropagation) para ajustar los pesos.

4.  **`chef-bot-scratch-final/`**:
    *   **Qué es**: La carpeta que contiene el "cerebro" final del modelo.
    *   **Para qué sirve**: Guarda los archivos matemáticos (`model.safetensors`, `config.json`) que representan lo que la IA ha aprendido. Esta carpeta ES la IA.

5.  **`inference_scratch.py`**:
    *   **Qué es**: Un script para usar el modelo.
    *   **Para qué sirve**: Carga el cerebro entrenado y permite que un humano escriba ingredientes para recibir una receta. Es la demostración de que funciona.

6.  **`chef-bot-scratch.gguf`**:
    *   **Qué es**: El modelo convertido a formato GGUF.
    *   **Para qué sirve**: Archivo listo para ser cargado en **LM Studio** u otras herramientas locales. Permite usar tu IA con una interfaz gráfica amigable.

## 4. Cómo Usar el Modelo
Para probar tu creación, simplemente ejecuta el script de inferencia:

```bash
python inference_scratch.py
```

Esto cargará tu modelo personalizado y generará recetas basadas en ingredientes nuevos.

## 5. Conclusión
Hemos logrado crear un modelo funcional especializado en una tarea concreta (cocina) sin depender de grandes tecnológicas ni modelos pre-entrenados. Aunque es pequeño ("Tiny LLM"), demuestra los principios fundamentales de la Inteligencia Artificial Generativa: Datos + Arquitectura + Computación = Conocimiento.
