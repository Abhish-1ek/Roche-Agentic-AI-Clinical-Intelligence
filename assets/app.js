(() => {
  const CONFIG = {
    // Replace this with your other GitHub Pages URL.
    // Example: https://your-user.github.io/roche-architecture-overview/
    ARCH_URL: "https://YOUR-USERNAME.github.io/YOUR-ARCH-REPO/"
  };

  const root = document.getElementById("diagram");
  const status = document.getElementById("status");
  const timeline = document.getElementById("timelineText");
  const progress = document.getElementById("progress");
  const detail = document.getElementById("detail");
  const archLink = document.getElementById("archLink");
  const playButton = document.getElementById("play");
  const pauseButton = document.getElementById("pause");
  const stopButton = document.getElementById("stop");
  const stepButton = document.getElementById("step");
  const resetButton = document.getElementById("reset");

  archLink.href = CONFIG.ARCH_URL;

  const nodes = [...root.querySelectorAll(".node")];
  const callouts = ["callout1", "callout2", "callout3", "callout4"]
    .map(id => document.getElementById(id));

  const details = {
    patient: {
      title: "Patient",
      body: "Entry point for patient-generated information such as symptoms, patient-reported outcomes and approved digital signals.",
      tags: ["digital channels", "PROs", "consent"]
    },
    diagnostics: {
      title: "Diagnostics",
      body: "Lab, imaging and pathology signals provide structured and unstructured clinical observations for the longitudinal context.",
      tags: ["LIS", "imaging", "pathology"]
    },
    context: {
      title: "Patient Context",
      body: "Normalises and assembles longitudinal context so agents reason over a patient state rather than an isolated event.",
      tags: ["FHIR", "EHR", "timeline", "identity"]
    },
    orchestrator: {
      title: "Agent Orchestrator",
      body: "Coordinates specialised agents, tools, memory, state transitions, retries and policy-aware routing.",
      tags: ["state machine", "tools", "memory", "traceability"]
    },
    signal: {
      title: "Signal Agent",
      body: "Detects meaningful changes and asks which observations require deeper contextual analysis.",
      tags: ["trend detection", "anomaly detection", "thresholds"]
    },
    evidence: {
      title: "Evidence Agent",
      body: "Retrieves and validates relevant evidence before a reasoning package is assembled.",
      tags: ["hybrid search", "reranking", "citations"]
    },
    clinical: {
      title: "Clinical Reasoning Agent",
      body: "Produces structured reasoning, uncertainty, alternatives and missing-information requests for clinician review.",
      tags: ["structured output", "uncertainty", "explainability"]
    },
    rag: {
      title: "RAG",
      body: "Hybrid retrieval combines exact matching, semantic retrieval, metadata filters and reranking.",
      tags: ["BM25", "vectors", "reranker"]
    },
    graph: {
      title: "Knowledge Graph",
      body: "Represents relationships between observations, conditions, tests, therapies and evidence.",
      tags: ["ontology", "relationships", "traversal"]
    },
    safety: {
      title: "Safety Gateway",
      body: "Policy enforcement point for consent, access, guardrails, risk classification, audit and human-in-the-loop decisions.",
      tags: ["policy engine", "PHI", "audit", "guardrails"]
    },
    human: {
      title: "Human Approval",
      body: "Clinician remains accountable for consequential decisions and approves governed actions where required.",
      tags: ["HITL", "review", "override"]
    },
    action: {
      title: "Care Action",
      body: "Turns approved recommendations into bounded workflows such as follow-up tasks or clinician notifications.",
      tags: ["workflow", "API", "escalation"]
    },
    outcome: {
      title: "Patient Outcome",
      body: "Measures what happened after the intervention and feeds evaluation rather than silently changing the clinical system.",
      tags: ["outcome metrics", "evaluation", "feedback"]
    }
  };

  const flowIds = [
    "f1","f2","f3","f4","f6","f7","f5","f8","f9","f10","f11","f12","f13","f14"
  ];

  const labels = [
    "Patient signal enters the platform",
    "Diagnostics enrich the observation",
    "Patient context assembled",
    "Orchestrator receives the state",
    "Signal + evidence agents fan out",
    "RAG + knowledge graph queried",
    "Clinical reasoning package created",
    "Safety gateway evaluates risk",
    "Human approval required for consequential action",
    "Approved care workflow executes",
    "Outcome captured",
    "Outcome loops back to evaluation",
    "Architecture ready for the next event"
  ];

  const routeMap = {
    1:[0],
    2:[1],
    3:[2],
    4:[3],
    5:[4,5],
    6:[6,7,8],
    7:[9],
    8:[10],
    9:[11],
    10:[12]
  };

  const stepToIds = {
    1:["patient"],
    2:["diagnostics"],
    3:["context"],
    4:["orchestrator"],
    5:["signal","evidence","rag","graph"],
    6:["clinical"],
    7:["safety"],
    8:["human"],
    9:["action"],
    10:["outcome"]
  };

  let step = 0;
  let playing = false;
  let frameId = 0;

  function selectNode(id) {
    nodes.forEach(node => node.classList.toggle("selected", node.dataset.id === id));
    const item = details[id];
    if (!item) return;

    detail.innerHTML =
      `<div class="detail-title">${item.title}</div>` +
      `<p>${item.body}</p>` +
      `<div class="tagrow">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>`;
  }

  function setActive(currentStep) {
    nodes.forEach(node => node.classList.remove("active"));

    (stepToIds[currentStep] || []).forEach(id => {
      const node = root.querySelector(`[data-id="${id}"]`);
      if (node) node.classList.add("active");
    });

    root.querySelectorAll(".flow").forEach(flow => flow.classList.remove("active"));

    (routeMap[currentStep] || []).forEach(index => {
      const flow = document.getElementById(flowIds[index]);
      if (flow) flow.classList.add("active");
    });

    progress.style.width = `${Math.min(100, Math.max(0, (currentStep / 10) * 100))}%`;

    status.textContent = currentStep
      ? `Step ${currentStep} / 10 — ${labels[Math.min(currentStep - 1, labels.length - 1)]}`
      : "Ready — click Play flow or Step";

    timeline.innerHTML = currentStep
      ? `<b>${labels[Math.min(currentStep - 1, labels.length - 1)]}</b><br>Click a node to inspect the architecture component.`
      : `Press <b>Play flow</b> to watch the signal move through the platform. <b>Step</b> advances one architectural stage at a time.`;

    callouts.forEach((callout, index) => {
      callout.setAttribute("opacity", currentStep === index + 1 || currentStep === index + 2 ? "1" : "0");
    });
  }

  function pointAt(path, t) {
    const length = path.getTotalLength();
    return path.getPointAtLength(Math.max(0, Math.min(length, length * t)));
  }

  function animateParticles(timestamp) {
    if (!playing) return;

    const paths = [
      document.getElementById("f1"),
      document.getElementById("f3"),
      document.getElementById("f6"),
      document.getElementById("f7"),
      document.getElementById("f11"),
      document.getElementById("f14")
    ];

    const particleIds = ["p1","p2","p3","p4","p5","p6"];
    const cycle = (timestamp % 7000) / 7000;

    paths.forEach((path, i) => {
      if (!path) return;
      const point = pointAt(path, (cycle + i * 0.16) % 1);
      const particle = document.getElementById(particleIds[i]);
      particle.setAttribute("cx", point.x);
      particle.setAttribute("cy", point.y);
      particle.setAttribute("opacity", "1");
    });

    frameId = requestAnimationFrame(animateParticles);
  }

  function hideParticles() {
    root.querySelectorAll(".particle").forEach(particle => particle.setAttribute("opacity", "0"));
  }

  function play() {
    playing = true;
    if (step >= 10) step = 0;
    setActive(Math.max(1, step));
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(animateParticles);
    status.textContent = "Playing architecture flow…";
  }

  function pause() {
    playing = false;
    cancelAnimationFrame(frameId);
    hideParticles();
    status.textContent = "Paused";
  }

  function stop() {
    playing = false;
    cancelAnimationFrame(frameId);
    hideParticles();
    status.textContent = "Stopped — current stage retained";
  }

  function next() {
    playing = false;
    cancelAnimationFrame(frameId);
    hideParticles();
    step = step >= 10 ? 1 : step + 1;
    setActive(step);
  }

  function reset() {
    playing = false;
    cancelAnimationFrame(frameId);
    hideParticles();
    step = 0;
    setActive(0);
    nodes.forEach(node => node.classList.remove("selected"));
    detail.innerHTML =
      `<div class="detail-title">Click a component</div>` +
      `<p>Select an architecture component to inspect its role, inputs and typical implementation concerns.</p>`;
  }

  nodes.forEach(node => {
    node.addEventListener("click", () => {
      selectNode(node.dataset.id);
      status.textContent = `Selected: ${details[node.dataset.id].title}`;
    });

    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectNode(node.dataset.id);
        status.textContent = `Selected: ${details[node.dataset.id].title}`;
      }
    });
  });

  playButton.addEventListener("click", play);
  pauseButton.addEventListener("click", pause);
  stopButton.addEventListener("click", stop);
  stepButton.addEventListener("click", next);
  resetButton.addEventListener("click", reset);

  setActive(0);
})();
