// Fixed overhead team camera: blue back / red front.
globalThis.DW_TROOP_CAMERA_CATALOG = (() => {
const data={
  "TROOP_INF_BLUE": {
    "name": "Bộ binh",
    "kind": "inf",
    "faction": "blue",
    "source": "./assets/troops-camera-team/blue-back-red-front-92e32037.webp",
    "width": 1024,
    "height": 1536,
    "extent": 398,
    "frame": {
      "width": 86,
      "height": 86,
      "anchorX": 0.5,
      "anchorY": 0.96
    },
    "poses": {
      "back": {
        "x": 127,
        "y": 64,
        "width": 335,
        "height": 358,
        "footX": 269,
        "footY": 415
      }
    }
  },
  "TROOP_INF_RED": {
    "name": "Bộ binh",
    "kind": "inf",
    "faction": "red",
    "source": "./assets/troops-camera-team/blue-back-red-front-92e32037.webp",
    "width": 1024,
    "height": 1536,
    "extent": 398,
    "frame": {
      "width": 86,
      "height": 86,
      "anchorX": 0.5,
      "anchorY": 0.96
    },
    "poses": {
      "front": {
        "x": 555,
        "y": 72,
        "width": 344,
        "height": 347,
        "footX": 764,
        "footY": 413
      }
    }
  },
  "TROOP_CAV_BLUE": {
    "name": "Kỵ binh",
    "kind": "cav",
    "faction": "blue",
    "source": "./assets/troops-camera-team/blue-back-red-front-92e32037.webp",
    "width": 1024,
    "height": 1536,
    "extent": 615,
    "frame": {
      "width": 98,
      "height": 98,
      "anchorX": 0.5,
      "anchorY": 0.96
    },
    "poses": {
      "back": {
        "x": 158,
        "y": 458,
        "width": 280,
        "height": 553,
        "footX": 279,
        "footY": 991
      }
    }
  },
  "TROOP_CAV_RED": {
    "name": "Kỵ binh",
    "kind": "cav",
    "faction": "red",
    "source": "./assets/troops-camera-team/blue-back-red-front-92e32037.webp",
    "width": 1024,
    "height": 1536,
    "extent": 615,
    "frame": {
      "width": 98,
      "height": 98,
      "anchorX": 0.5,
      "anchorY": 0.96
    },
    "poses": {
      "front": {
        "x": 619,
        "y": 512,
        "width": 271,
        "height": 494,
        "footX": 762,
        "footY": 999
      }
    }
  },
  "TROOP_ARCH_BLUE": {
    "name": "Cung thủ",
    "kind": "arch",
    "faction": "blue",
    "source": "./assets/troops-camera-team/blue-back-red-front-92e32037.webp",
    "width": 1024,
    "height": 1536,
    "extent": 480,
    "frame": {
      "width": 86,
      "height": 86,
      "anchorX": 0.5,
      "anchorY": 0.96
    },
    "poses": {
      "back": {
        "x": 162,
        "y": 1054,
        "width": 252,
        "height": 399,
        "footX": 274,
        "footY": 1446
      }
    }
  },
  "TROOP_ARCH_RED": {
    "name": "Cung thủ",
    "kind": "arch",
    "faction": "red",
    "source": "./assets/troops-camera-team/blue-back-red-front-92e32037.webp",
    "width": 1024,
    "height": 1536,
    "extent": 480,
    "frame": {
      "width": 86,
      "height": 86,
      "anchorX": 0.5,
      "anchorY": 0.96
    },
    "poses": {
      "front": {
        "x": 594,
        "y": 1046,
        "width": 345,
        "height": 432,
        "footX": 767,
        "footY": 1472
      }
    }
  }
};
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};return freeze(data);})();
