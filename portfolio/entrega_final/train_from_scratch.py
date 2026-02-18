import os
import torch
from datasets import load_dataset
from transformers import (
    AutoConfig,
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)

# 1. Configuración del Modelo "Mini-GPT" (Desde Cero)
model_config = AutoConfig.from_pretrained(
    "gpt2",
    vocab_size=50257,
    n_positions=1024,
    n_ctx=1024,
    n_embd=512,        # Dimensiones reducidas (original: 768)
    n_layer=6,         # Menos capas (original: 12)
    n_head=8,          # Menos cabezas (original: 12)
)

print("Inicializando modelo con pesos aleatorios...")
model = AutoModelForCausalLM.from_config(model_config)
print(f"Parámetros del modelo: {model.num_parameters() / 1e6:.1f}M")

# 2. Tokenizer (Usamos el de GPT-2 como base para codificar, pero el modelo es virgen)
tokenizer = AutoTokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token

# 3. Cargar Dataset Generado
dataset = load_dataset("json", data_files="recetas_extended.jsonl", split="train")

def format_prompts(examples):
    texts = []
    for instruction, output in zip(examples["instruction"], examples["output"]):
        # Formato simple: Instrucción -> Respuesta
        text = f"User: {instruction}\nAssistant: {output}{tokenizer.eos_token}"
        texts.append(text)
    return {"text": texts}

dataset = dataset.map(format_prompts, batched=True)

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# 4. Configurar Entrenamiento
training_args = TrainingArguments(
    output_dir="./chef-bot-scratch",
    overwrite_output_dir=True,
    num_train_epochs=100,              # 100 vueltas (petición usuario)
    per_device_train_batch_size=4,     # Lotes un poco más grandes
    save_steps=500,
    save_total_limit=2,
    prediction_loss_only=True,
    learning_rate=5e-4,                # Tasa alta para aprender rápido desde cero
    weight_decay=0.01,
    logging_steps=50,
    fp16=torch.cuda.is_available(),    # Usar GPU si se puede
)

data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer, mlm=False,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets,
    data_collator=data_collator,
)

# 5. Entrenar
print("Iniciando entrenamiento desde cero...")
trainer.train()

# 6. Guardar Modelo Final
print("Guardando modelo final...")
trainer.save_model("./chef-bot-scratch-final")
tokenizer.save_pretrained("./chef-bot-scratch-final")
print("¡Entrenamiento completado!")
