from app import db
import datetime

class Pacientes(db.Model):
    paciente_id = db.Column(db.Integer, primary_key=True)
    paciente_nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.datetime.now)
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        
    def to_dict(self):
        return {
            'paciente_id': self.paciente_id,
            'paciente_nome': self.paciente_nome,
            'email': self.email,
        }

class Agenda(db.Model):
    agenda_id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.paciente_id'), nullable=False)
    dent_esp_id = db.Column(db.Integer, db.ForeignKey('dentista_especializacao.dent_espec_id'), nullable=False)
    data_consulta = db.Column(db.Date, nullable=False)
    hora_consulta = db.Column(db.Time, nullable=False)
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def to_dict(self):
        return {
            'agenda_id': self.agenda_id,
            'paciente_id': self.paciente_id,
            'dent_esp_id': self.dent_esp_id,
            'data_consulta': self.data_consulta.strftime('%Y-%m-%d'),
            'hora_consulta': self.hora_consulta.strftime('%H:%M:%S'),
        }

class DentistaEspecializacao(db.Model):
    dent_espec_id = db.Column(db.Integer, primary_key=True)
    dentista_id = db.Column(db.Integer, db.ForeignKey('dentistas.dentista_id'), nullable=False)
    dentista_nome = db.relationship('Dentistas', back_populates='especializacoes')
    especializacao_id = db.Column(db.Integer, db.ForeignKey('especializacao.especializacao_id'), nullable=False)
    especializacao = db.relationship('Especializacao', backref='dentista_especializacoes')
    tempo = db.Column(db.Integer, nullable=False)
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        
    def to_dict(self):
        return {
            'dent_espec_id': self.dent_espec_id,
            'dentista_id': self.dentista_id,
            'especializacao_id': self.especializacao_id,
            'tempo': self.tempo,
        }        
class Dentistas(db.Model):
    dentista_id = db.Column(db.Integer, primary_key=True)
    firabase_uid = db.Column(db.String(100), nullable=False)
    dentista_nome = db.Column(db.String(100), nullable=False)
    dentista_email = db.Column(db.String(100), unique=True, nullable=False)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.datetime.now)
    especializacoes = db.relationship('DentistaEspecializacao', back_populates='dentista_nome')
    
    def save(self):
        db.session.add(self)
        db.session.commit()
        
    def to_dict(self):
        return {
            'dentista_id': self.dentista_id,
            'dentista_nome': self.dentista_nome,
            'dentista_email': self.dentista_email,
        }
        
class Especializacao(db.Model):
    especializacao_id = db.Column(db.Integer, primary_key=True)
    especializacao_nome = db.Column(db.String(100), nullable=False)
    
    def save(self):
        db.session.add(self)
        db.session.commit()