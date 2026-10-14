#!/usr/bin/env python3
"""Verified 2.5D production eligibility; no artwork generation or release approval."""
import importlib.util
from pathlib import Path

spec=importlib.util.spec_from_file_location('equipment_gate',Path(__file__).with_name('equipment-modeling-gate.py'))
gate=importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)

if __name__=='__main__': gate.main()
