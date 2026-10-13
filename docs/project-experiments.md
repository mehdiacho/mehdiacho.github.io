# Proposed experiments — 2026-10-13

These are proposed directions, not claims of completed work. The existing EEG graph-versus-convolution comparison remains the actual MSc research. The on-site sketchbook makes that distinction explicit.

## Suggested first project: the imperfect image lab

Start with one uploaded image processed locally: controllable blur, noise and compression, plus a before/after slider. Compare a classical baseline with a compact restoration model. Publish quality, speed and failure cases rather than just attractive outputs. Split source images before creating corruptions to avoid train/test leakage. Do not claim recovered details are factual. OpenCV's [non-local means documentation](https://docs.opencv.org/4.x/d5/d69/tutorial_py_non_local_means.html) provides a concrete baseline. This is the easiest first demonstration to understand without a research background.

## Graph detective

An interactive graph lets a visitor remove edges and inspect prediction changes. Compare highlighted explanation edges with intervention results, and compare the GNN with simple structural features. Publish fidelity/sensitivity metrics and use graph-held-out evaluation. [PyTorch Geometric's explanation tutorial](https://pytorch-geometric.readthedocs.io/en/latest/tutorial/explain.html) documents available explanation methods; its API is evolving, so pin the eventual implementation version. This is the strongest companion to Mehdi's existing research interests.

## Air instruments

Hand gestures play a small instrument, with landmarks and confidence visible. Compare simple rules to a learned gesture classifier. Measure false triggers and end-to-end latency under varied backgrounds/lighting. Use opt-in camera access, local processing and a keyboard alternative. [MediaPipe's web hand-landmark guide](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/web_js) notes that detection blocks the calling thread: move inference off the UI thread. No camera feature has been implemented on the portfolio.

## Find that moment

Search an openly licensed clip collection by what happens in a scene. Compare captions alone, image/text embeddings and temporal aggregation. Publish recall@k, timestamp error, hardware/latency and a fixed query set. [The Transformers CLIP documentation](https://huggingface.co/docs/transformers/model_doc/clip) is a starting point for image/text matching, not a guarantee of reliable temporal understanding. Show ambiguous and failed searches alongside successful ones.

## Shared presentation standard

Each eventual project should have a runnable demo, a specific question, data provenance/license, a simple baseline, held-out evaluation, reproducible settings and a limitations section. Avoid unrelated impressive-sounding claims. Keep unfinished ideas out of the completed-project collection and Firestore unless they are intentionally published as concepts.
