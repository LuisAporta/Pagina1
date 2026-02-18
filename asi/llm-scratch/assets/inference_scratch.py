from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

model_path = "./chef-bot-scratch-final"

print(f"Cargando modelo desde {model_path}...")
model = AutoModelForCausalLM.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

def generar_receta(ingredientes):
    prompt = f"User: Tengo {ingredientes}.\nAssistant:"
    print(f"\nGenerando para: '{ingredientes}'...")
    
    resultado = generator(
        prompt, 
        max_length=200, 
        num_return_sequences=1, 
        do_sample=True, 
        top_k=50,
        top_p=0.95,
        temperature=0.7,
        repetition_penalty=1.2,
        truncation=True,
        pad_token_id=tokenizer.eos_token_id
    )
    
    texto = resultado[0]['generated_text']
    # Cortar después del prompt para ver solo la respuesta
    respuesta = texto.replace(prompt, "").strip()
    return respuesta

# Pruebas
print("-" * 50)
print(generar_receta("pollo, limón y arroz"))
print("-" * 50)
print(generar_receta("huevos y patatas"))
print("-" * 50)
