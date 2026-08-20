"""
Base Agent architecture and inter-agent message protocol.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, List, Optional


@dataclass
class AgentMessage:
    """Inter-Agent communication message standard."""
    sender: str
    recipient: str
    topic: str
    payload: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))


class BaseAgent(ABC):
    """Abstract base class for domain agents in the Predictive Maintenance System."""

    def __init__(self, agent_id: str, name: str, role: str):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.inbox: List[AgentMessage] = []
        self.outbox: List[AgentMessage] = []

    def receive_message(self, message: AgentMessage):
        """Pushes incoming message to inbox."""
        self.inbox.append(message)

    def send_message(self, recipient: str, topic: str, payload: Dict[str, Any]) -> AgentMessage:
        """Constructs an outgoing message."""
        msg = AgentMessage(
            sender=self.agent_id,
            recipient=recipient,
            topic=topic,
            payload=payload
        )
        self.outbox.append(msg)
        return msg

    @abstractmethod
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution logic of the agent."""
        pass
