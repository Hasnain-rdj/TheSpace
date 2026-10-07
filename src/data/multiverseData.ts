export interface MultiverseTier {
  id: string;
  name: string;
  classification: string;
  primaryProponents: string;
  coreTheoreticalBasis: string;
  physicalImplications: string;
  mathematicalFormulation: string;
  observationalSignatures: string;
  dimensionCount: string;
  landscapeDiversity: string;
  faq: Array<{ question: string; answer: string }>;
}

export const MULTIVERSE_ENCYCLOPEDIA: MultiverseTier[] = [
  {
    id: 'tegmark-level-1',
    name: 'Tegmark Level I Multiverse: Beyond the Cosmic Particle Horizon',
    classification: 'Ergodic Spatial Infinity in Flat Space',
    primaryProponents: 'Max Tegmark, Alexander Vilenkin',
    coreTheoreticalBasis:
      'If space is mathematically infinite and matter distribution is statistically homogeneous on macroscopic scales (supported by WMAP and Planck observations that spatial curvature Ω_k ≈ 0), then identical arrangements of matter must repeat infinitely many times across distant Hubble volumes.',
    physicalImplications:
      'Because a single Hubble volume contains a finite number of quantum microstates (approx. 2^(10^118) states), identical Hubble volumes repeat at distances around 10^(10^29) meters. In an infinite flat universe, an exact duplicate of you reading this screen exists right now at that statistical distance.',
    mathematicalFormulation:
      'N_states = exp(S_max / k_B) = exp(3π c^5 / (G ħ H^2)) ≈ 10^(10^122) microstates per Hubble sphere.',
    observationalSignatures:
      'Precision measurements of cosmic spatial curvature Ω_k = 0.0007 ± 0.0019 (Planck 2018), confirming global Euclidean flatness without observable topological wrapping.',
    dimensionCount: '3 Spatial + 1 Temporal (4D Spacetime)',
    landscapeDiversity:
      'Identical physical laws, same fundamental particles, same electron mass, but divergent initial conditions and matter configurations.',
    faq: [
      {
        question: 'Can we communicate with Level I parallel universes?',
        answer:
          'No. Due to the metric expansion of spacetime and the finite speed of light, points beyond the particle horizon are receding faster than light and can never exchange causal signals.',
      },
    ],
  },
  {
    id: 'tegmark-level-2',
    name: 'Tegmark Level II Multiverse: Post-Inflationary Bubble Universes',
    classification: 'Chaotic Eternal Inflation & String Landscape',
    primaryProponents: 'Alan Guth, Andrei Linde, Leonard Susskind',
    coreTheoreticalBasis:
      'During early cosmological inflation, the inflaton scalar field decays into thermal reheating in certain regions while continuing to expand exponentially in others. This produces an eternal tree of isolated bubble (pocket) universes nucleating in an eternally inflating quantum vacuum.',
    physicalImplications:
      'Each bubble universe experiences distinct spontaneous symmetry breaking. Fundamental parameters—such as the fine structure constant α, cosmological constant Λ, and quark masses—can take different values in different bubbles.',
    mathematicalFormulation:
      'Vacuum energy V(φ) with multiple local minima. String landscape compactification on Calabi-Yau 3-folds produces ~10^500 flux vacua.',
    observationalSignatures:
      'Potential circular temperature dis-continuities (cold/hot spots) in the Cosmic Microwave Background produced by rare bubble-bubble collisions occurring prior to local inflation.',
    dimensionCount: '10D (Superstrings) / 11D (M-Theory)',
    landscapeDiversity:
      'Divergent physical constants, different particle spectrums, varying numbers of macroscopic spatial dimensions.',
    faq: [
      {
        question: 'What is the String Landscape?',
        answer:
          'String theory requires 6 extra compact dimensions. The astronomical number of topological ways to wrap magnetic and electric fluxes around internal cycles creates approximately 10^500 distinct vacuum energy states.',
      },
    ],
  },
  {
    id: 'tegmark-level-3',
    name: 'Tegmark Level III Multiverse: Many-Worlds Quantum Branching',
    classification: 'Everettian Unitary Quantum Mechanics',
    primaryProponents: 'Hugh Everett III, Bryce DeWitt, David Deutsch',
    coreTheoreticalBasis:
      'The universal wavefunction evolves deterministically according to the linear Schrödinger equation without wavefunction collapse. When a quantum system becomes entangled with its macroscopic environment (decoherence), the universal state branches into mutually orthogonal, non-interfering Everett worlds.',
    physicalImplications:
      'Every time a quantum superposition decoheres, reality splits into distinct parallel branches. All outcomes consistent with the quantum state vector physically happen in parallel Hilbert space subspaces.',
    mathematicalFormulation:
      '|Ψ_univ⟩ = ∑ c_i |Observer_i⟩ ⊗ |Outcome_i⟩; i ℏ ∂/∂t |Ψ_univ⟩ = Ĥ |Ψ_univ⟩ (Pure unitary evolution).',
    observationalSignatures:
      'Quantum interference experiments, delayed-choice quantum erasers, and quantum computer gate fidelity testing.',
    dimensionCount: 'Infinite-dimensional separable Hilbert space ℋ',
    landscapeDiversity:
      'Identical physical laws and constants; every quantum probability branch is realized simultaneously.',
    faq: [
      {
        question: 'Is Level III different from Level I?',
        answer:
          'Surprisingly, Tegmark and Susskind showed that in an eternally inflating universe with infinite quantum branches, the Level III Many-Worlds branches map onto the spatial Level I Hubble volumes (quantum-classical equivalence).',
      },
    ],
  },
  {
    id: 'tegmark-level-4',
    name: 'Tegmark Level IV Multiverse: The Mathematical Universe Hypothesis',
    classification: 'Platonic Mathematical Monism',
    primaryProponents: 'Max Tegmark',
    coreTheoreticalBasis:
      'Physical existence is mathematically isomorphic to mathematical existence. Any mathematical structure that is formalizable without contradictions physically exists as an independent universe.',
    physicalImplications:
      'Our physical universe is not just described by mathematics; it IS a mathematical structure. Universes based on entirely non-quantum, non-computable, or exotic geometric axiomatic systems are all physically realized.',
    mathematicalFormulation:
      'The ensemble of all Gödel-consistent axiomatic systems with computable relations.',
    observationalSignatures:
      'The uncanny effectiveness of mathematics in natural sciences (Wigner’s question) is explained: physical reality is pure mathematical structure.',
    dimensionCount: 'Arbitrary (0D to infinite dimensions)',
    landscapeDiversity:
      'Total diversity: universes without quantum mechanics, without relativity, with non-standard logic, or purely cellular automata.',
    faq: [
      {
        question: 'Why does Level IV solve the "Why is there something rather than nothing?" problem?',
        answer:
          'Because if all consistent mathematical structures exist, there is no special preference for "nothingness" over "somethingness"; existence is mathematically complete and invariant.',
      },
    ],
  },
  {
    id: 'holographic-ads-cft',
    name: 'The Holographic Principle & AdS/CFT Correspondence',
    classification: 'Quantum Gravity Holography & Bulk-Boundary Duality',
    primaryProponents: 'Juan Maldacena, Gerard ’t Hooft, Leonard Susskind',
    coreTheoreticalBasis:
      'A gravitational theory in an (d+1)-dimensional Anti-de Sitter (AdS) spacetime bulk is exactly mathematically dual to a conformal field theory (CFT) without gravity living on the d-dimensional boundary.',
    physicalImplications:
      'Spacetime, gravity, and even the third spatial dimension are emergent macroscopic phenomena generated by the quantum entanglement of particles on a lower-dimensional bounding surface.',
    mathematicalFormulation:
      'Z_AdS[φ_0] = ⟨exp(∫ φ_0 𝒪 d^d x)⟩_CFT; S_BH = A / (4 G ħ) (Bekenstein-Hawking Area Law).',
    observationalSignatures:
      'Ryu-Takayanagi formula linking holographic entanglement entropy with minimal surface areas in Riemannian geometry.',
    dimensionCount: 'Dual between (d+1)D bulk gravity and dD boundary quantum field theory.',
    landscapeDiversity:
      'Demonstrates that spacetime itself is not fundamental, but rather an error-correcting quantum code.',
    faq: [
      {
        question: 'Does this mean our universe is a hologram?',
        answer:
          'In a rigorous mathematical sense, yes: all gravitational dynamics occurring within a volume of space can be fully computed and accounted for using degrees of freedom on the enclosing boundary horizon.',
      },
    ],
  },
];
