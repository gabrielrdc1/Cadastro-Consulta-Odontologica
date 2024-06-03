schema_paciente = {
    "type": "object",
    "properties": {
        "paciente_nome": {"type": "string"},
        "cpf": {
            "type": "string",
            "pattern": "^\\d{11}$"
        },
        "email": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
        },
        "password": {"type": "string"}
    },
    "required": ["paciente_nome", "cpf", "email", "password"]
}

schema_consulta = {
    "type": "object",
    "properties": {
        "paciente_id": {"type": "integer"},
        "dent_esp_id": {"type": "integer"},
        "data_consulta": {"type": "string"},
        "hora_consulta": {"type": "string"}
    },
    "required": ["paciente_id", "dent_esp_id", "data_consulta", "hora_consulta"]
}

schema_dentista = {
    "type": "object",
    "properties": {
        "dentista_nome": {"type": "string"},
        "dentista_email": {"type": "string"}
    },
    "required": ["dentista_nome", "dentista_email"]
}

schema_especializacao = {
    "type": "object",
    "properties": {
        "especializacao_nome": {"type": "string"}
    },
    "required": ["especializacao_nome"]
}

schema_dentista_especializacao = {
    "type": "object",
    "properties": {
        "dentista_id": {"type": "integer"},
        "especializacao_id": {"type": "integer"}
    },
    "required": ["dentista_id", "especializacao_id"]
}