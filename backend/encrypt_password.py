#!/usr/bin/env python3
"""
Script Python pour générer un mot de passe chiffré compatible avec Jasypt
Algorithme: PBEWITHHMACSHA512ANDAES_256
"""

import sys
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os

def encrypt_password(key, password):
    """
    Chiffre un mot de passe avec Jasypt PBEWITHHMACSHA512ANDAES_256
    """
    salt = os.urandom(16)

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA512(),
        length=48,
        salt=salt,
        iterations=1000,
        backend=default_backend()
    )

    key_material = kdf.derive(key.encode('utf-8'))

    encryption_key = key_material[:32]
    iv = key_material[32:48]

    cipher = Cipher(
        algorithms.AES(encryption_key),
        modes.CBC(iv),
        backend=default_backend()
    )

    encryptor = cipher.encryptor()

    padding_length = 16 - (len(password) % 16)
    padded_password = password + (chr(padding_length) * padding_length)

    ciphertext = encryptor.update(padded_password.encode('utf-8')) + encryptor.finalize()

    result = salt + ciphertext

    encrypted_b64 = base64.b64encode(result).decode('utf-8')

    return encrypted_b64

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 encrypt_password.py <cle_jasypt> <mot_de_passe_db>")
        print("Exemple: python3 encrypt_password.py cosmetoKey test1234")
        sys.exit(1)

    key = sys.argv[1]
    password = sys.argv[2]

    try:
        encrypted = encrypt_password(key, password)
        print(f"spring.datasource.password=ENC({encrypted})")
        print(f"Au démarrage : JASYPT_ENCRYPTOR_PASSWORD={key}")
    except Exception as e:
        print(f"Erreur lors du chiffrement: {e}", file=sys.stderr)
        sys.exit(1)
