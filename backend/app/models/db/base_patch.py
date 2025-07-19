# Temporary UUID fix
import uuid as uuid_module

# Monkey patch the UUID module for SQLAlchemy compatibility
uuid_module.UUID = uuid_module.UUID