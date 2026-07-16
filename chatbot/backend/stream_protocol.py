import json
from typing import Any, Dict, Optional

def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"

def ui_text_delta(text: str) -> str:
    return _sse({"type": "text-delta", "delta": text})

def ui_tool_input_available(tool_call_id: str, tool_name: str, input_args: dict) -> str:
    return _sse({
        "type": "tool-input-available",
        "toolCallId": tool_call_id,
        "toolName": tool_name,
        "input": input_args
    })

def ui_tool_approval_request(tool_call_id: str, approval_id: str) -> str:
    return _sse({
        "type": "tool-approval-request",
        "approvalId": approval_id,
        "toolCall": {"toolCallId": tool_call_id}
    })

def ui_tool_output_available(tool_call_id: str, output: Any) -> str:
    return _sse({
        "type": "tool-output-available",
        "toolCallId": tool_call_id,
        "output": output
    })

def ui_data_trace(tool_call_id: str, tool_name: str, label: str, status: str, detail: Optional[str] = None) -> str:
    data = {
        "toolCallId": tool_call_id,
        "toolName": tool_name,
        "label": label,
        "status": status,
    }
    if detail:
        data["detail"] = detail
    return _sse({
        "type": "data-trace",
        "id": tool_call_id,
        "data": data
    })
