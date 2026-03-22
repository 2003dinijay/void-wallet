import os
from mnemonic import Mnemonic
from bip_utils import Bip39SeedGenerator


def validate_mnemonic(phrase: str) -> bool:
    mnemo = Mnemonic("english")
    return mnemo.check(phrase)


def mnemonic_to_seed(phrase: str, passphrase: str = "") -> bytes:
    return Bip39SeedGenerator(phrase).Generate(passphrase)


def generate_mnemonic(strength_bits: int = 128) -> str:
    entropy = os.urandom(strength_bits // 8)
    mnemo = Mnemonic("english")
    return mnemo.to_mnemonic(entropy)
