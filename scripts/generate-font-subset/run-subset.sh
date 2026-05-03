#!/usr/bin/env bash
set -euo pipefail
SUBSET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="${SUBSET_DIR}/.venv"
if [[ ! -d "${VENV}" ]]; then
  python3 -m venv "${VENV}"
  "${VENV}/bin/pip" install -q -r "${SUBSET_DIR}/requirements.txt"
fi
exec "${VENV}/bin/python" "${SUBSET_DIR}/generate.font-subset.py" "$@"
