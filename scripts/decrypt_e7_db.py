#!/usr/bin/env python3
"""
Epic Seven Database Decryptor
Decrypts .db files from the game datamine using the 129-byte XOR key.
"""

import os
import sys
import sqlite3
import json

# 129-byte XOR key from EpicSevenAssetRipper
XOR_KEY = bytes([
    0x21, 0x0c, 0xed, 0x10, 0xd8, 0x81, 0xd7, 0xa3, 0xfa, 0x9b, 0xc9, 0x7a, 0xd3, 0xae, 0xeb, 0x6d,
    0x98, 0x89, 0x31, 0x34, 0x2d, 0x39, 0x1e, 0x1f, 0xe1, 0xc4, 0x7c, 0xdd, 0x2d, 0xef, 0x26, 0x37,
    0x7a, 0xfa, 0xbf, 0xd2, 0xd9, 0x60, 0x79, 0xf1, 0xca, 0x99, 0xd0, 0x32, 0xf7, 0xd8, 0x4d, 0x4e,
    0xf6, 0xce, 0x45, 0xda, 0x0c, 0x67, 0x99, 0x09, 0xe6, 0x89, 0x75, 0x69, 0x5f, 0xd9, 0x12, 0xa2,
    0x3e, 0x77, 0x74, 0x3c, 0xf5, 0xbe, 0x2e, 0x57, 0x64, 0x05, 0x1a, 0x71, 0x96, 0x62, 0x23, 0x25,
    0x80, 0x63, 0xfc, 0xe7, 0xc6, 0xd4, 0xe7, 0xca, 0x76, 0x7d, 0x70, 0x3c, 0xcb, 0xe2, 0x31, 0xc5,
    0xed, 0x03, 0x8d, 0xcc, 0xad, 0x1a, 0x75, 0x53, 0x4a, 0x61, 0x27, 0xb8, 0x30, 0xca, 0xeb, 0x73,
    0xb4, 0xc6, 0xd6, 0xdb, 0xda, 0x00, 0x88, 0xe2, 0x11, 0x21, 0xef, 0xd5, 0xf3, 0x8a, 0x02, 0x1f,
    0x06
])
KEY_LEN = len(XOR_KEY)

def decrypt_bytes(encrypted_data: bytes) -> bytes:
    """Decrypt data using XOR with the 129-byte key."""
    decrypted = bytearray(len(encrypted_data))
    for i in range(len(encrypted_data)):
        decrypted[i] = encrypted_data[i] ^ XOR_KEY[i % KEY_LEN]
    return bytes(decrypted)

def decrypt_file(input_path: str, output_path: str = None) -> bytes:
    """Decrypt a single .db file."""
    with open(input_path, 'rb') as f:
        encrypted_data = f.read()
    
    decrypted = decrypt_bytes(encrypted_data)
    
    # Check if result looks like YUNADBS or SQLite
    header = decrypted[:7]
    header_str = header.decode('ascii', errors='ignore')
    
    print(f"Decrypted header: {header_str}")
    print(f"Decrypted hex: {decrypted[:16].hex()}")
    
    if output_path:
        with open(output_path, 'wb') as f:
            f.write(decrypted)
        print(f"Saved to: {output_path}")
    
    return decrypted

def test_decryption(input_path: str):
    """Test decryption and show first 100 bytes."""
    with open(input_path, 'rb') as f:
        encrypted = f.read()
    
    print(f"File: {input_path}")
    print(f"Size: {len(encrypted)} bytes")
    print(f"Encrypted first 16 bytes: {encrypted[:16].hex()}")
    
    decrypted = decrypt_bytes(encrypted)
    print(f"Decrypted first 16 bytes: {decrypted[:16].hex()}")
    
    # Try to show as ASCII
    try:
        ascii_str = decrypted[:64].decode('ascii', errors='replace')
        print(f"As ASCII: {ascii_str}")
    except:
        print("Could not decode as ASCII")
    
    return decrypted

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python decrypt_e7_db.py <input.db> [output]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    test_decryption(input_file)
    
    if output_file:
        decrypt_file(input_file, output_file)
