#!/usr/bin/env python3
"""
Hooly row labeler  -  tree-based true / false / unsure classifier.

Wrapper linking to src/label_rows.py
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
from label_rows import main, predict_labels

if __name__ == "__main__":
    main()
