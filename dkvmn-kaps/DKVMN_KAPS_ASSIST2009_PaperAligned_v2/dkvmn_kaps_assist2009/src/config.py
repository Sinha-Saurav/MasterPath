from dataclasses import dataclass

@dataclass
class ExperimentConfig:
    # Defaults based on reported experimental settings; dimensions are explicit reproduction choices.
    learning_rate: float = 0.001
    epochs: int = 100
    batch_size: int = 256
    dropout: float = 0.2
    key_dim: int = 50
    value_dim: int = 50
    question_dim: int = 50
    memory_size: int = 123
    cnn_layers: int = 3
    cnn_kernel_size: int = 6
    folds: int = 5
    validation_fraction: float = 0.15
    seed: int = 42
