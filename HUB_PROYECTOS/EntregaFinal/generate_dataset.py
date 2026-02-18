import json
import random

# Bases de datos de palabras
proteinas = ["pechugas de pollo", "muslos de pollo", "ternera", "cerdo", "merluza", "salmón", "atún", "huevos", "tofu", "carne picada", "costillas", "bacalao", "langostinos", "calamares", "lomo de cerdo"]
verduras = ["cebolla", "pimiento", "zanahoria", "calabacín", "berenjena", "ajo", "tomate", "espinacas", "brócoli", "champiñones", "puerro", "espárragos", "coliflor", "guisantes", "judías verdes"]
carbohidratos = ["patatas", "arroz", "pasta", "pan", "quinoa", "cuscús", "garbanzos", "lentejas", "alubias"]
extras = ["limón", "vino blanco", "nata", "queso rallado", "perejil", "albahaca", "pimentón", "comino", "laurel", "tomillo", "salsa de soja", "miel", "mostaza"]
tecnicas = ["al horno", "a la plancha", "estofado", "frito", "guisado", "al vapor", "en salsa", "salteado"]
adjetivos = ["delicioso", "rico", "sencillo", "espectacular", "casero", "tradicional", "ligero", "sabroso"]

# Plantillas de respuesta
plantillas_inicio = [
    "¡Claro! Puedes preparar un {adjetivo} '{plato}'. ",
    "Con esos ingredientes, te sugiero cocinar '{plato}'. ",
    "Una opción ideal es hacer '{plato}'. ",
    "¿Qué tal un {adjetivo} '{plato}'? ",
    "¡Mmm! Suena genial para preparar '{plato}'. "
]

plantillas_pasos = [
    "Primero, prepara los ingredientes. ",
    "Empieza lavando y cortando todo. ",
    "Pon una sartén o cazuela al fuego. ",
    "Precalienta el horno si es necesario. "
]

def generar_receta():
    ingredientes_usuario = []
    
    # Seleccionar 2-4 ingredientes aleatorios
    n_ing = random.randint(2, 4)
    pool = proteinas + verduras + carbohidratos + extras
    seleccion = random.sample(pool, n_ing)
    
    # Crear la instrucción del usuario
    formatos_input = [
        f"Tengo {', '.join(seleccion[:-1])} y {seleccion[-1]}.",
        f"Ingredientes: {', '.join(seleccion)}.",
        f"¿Qué cocino con {', '.join(seleccion)}?",
        f"Receta con {', '.join(seleccion)}.",
        f"Disponibles: {', '.join(seleccion)}."
    ]
    instruction = random.choice(formatos_input)
    
    # Decidir el nombre del plato
    proteina = next((x for x in seleccion if x in proteinas), "Verduras")
    tecnica = random.choice(tecnicas)
    nombre_plato = f"{proteina.capitalize()} {tecnica}"
    if any(x in seleccion for x in ["arroz", "pasta"]):
        base = next((x for x in seleccion if x in ["arroz", "pasta"]), "")
        nombre_plato = f"{base.capitalize()} con {proteina}"

    # Generar el cuerpo de la receta (ficticio pero coherente sintácticamente)
    pasos = random.choice(plantillas_pasos)
    
    if "horno" in tecnica:
        pasos += f"Coloca el {proteina} en una bandeja. Añade {random.choice(seleccion)} troceado. "
        pasos += f"Hornea a 180 grados durante unos 20-30 minutos hasta que esté dorado. "
    elif "plancha" in tecnica or "salteado" in tecnica:
        pasos += f"Cocina el {proteina} en la sartén con un poco de aceite. "
        pasos += f"Añade el {random.choice(seleccion)} y saltea todo junto a fuego fuerte. "
    elif "estofado" in tecnica or "guisado" in tecnica:
        pasos += f"Haz un sofrito con {random.choice(seleccion)}. Añade el {proteina} y cubre con agua o caldo. "
        pasos += "Deja cocinar a fuego lento hasta que todo esté tierno y la salsa haya espesado. "
    else:
        pasos += f"Mezcla el {proteina} con {random.choice(seleccion)}. "
        pasos += "Cocina todo junto hasta que esté en su punto. "
        
    pasos += f"Sazona al gusto y sirve caliente. ¡Que aproveche!"

    output = random.choice(plantillas_inicio).format(adjetivo=random.choice(adjetivos), plato=nombre_plato) + pasos
    
    return {"instruction": instruction, "output": output}

# Generar 5000 recetas
print("Generando dataset...")
with open("recetas_extended.jsonl", "w", encoding="utf-8") as f:
    for _ in range(5000):
        receta = generar_receta()
        json.dump(receta, f, ensure_ascii=False)
        f.write("\n")
print("¡Dataset generado: recetas_extended.jsonl (5000 ejemplos)!")
