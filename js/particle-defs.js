// Definição das partículas (31 tipos)
const PARTICLE_DEFS = {
  // Léptons
  electron:     {name:"Elétron",     symbol:"e⁻",  m0:2, charge:-1,    hue:200, saturation:80, lightness:70, flavor:"e",     isAnti:false, strongCharge:0, weakCharge:-1},
  muon:         {name:"Múon",        symbol:"μ⁻",  m0:32, charge:-1,    hue:210, saturation:80, lightness:70, flavor:"mu",    isAnti:false, strongCharge:0, weakCharge:-1},
  tau:          {name:"Tau",         symbol:"τ⁻",  m0:128,charge:-1,    hue:220, saturation:80, lightness:70, flavor:"tau",   isAnti:false, strongCharge:0, weakCharge:-1},
  nu_e:         {name:"Eletrino",    symbol:"νₑ",  m0:1,     charge:0,     hue:170, saturation:80, lightness:70, flavor:"nue",   isAnti:false, strongCharge:0, weakCharge:1},
  nu_mu:        {name:"Muonino",symbol:"νμ", m0:1,     charge:0,     hue:180, saturation:80, lightness:70, flavor:"numu",  isAnti:false, strongCharge:0, weakCharge:1},
  nu_tau:       {name:"Tauino",symbol:"ντ", m0:1,     charge:0,     hue:190, saturation:80, lightness:70, flavor:"nutau", isAnti:false, strongCharge:0, weakCharge:1},
  
  // Antiléptons
  positron:     {name:"Positron",    symbol:"e⁺",  m0:2, charge:1,     hue:200, saturation:80, lightness:30, flavor:"e",     isAnti:true,  strongCharge:0, weakCharge:1},
  antimuon:     {name:"Antimúon",    symbol:"μ⁺",  m0:32, charge:1,     hue:210, saturation:80, lightness:30, flavor:"mu",    isAnti:true,  strongCharge:0, weakCharge:1},
  antitau:      {name:"Antitau",     symbol:"τ⁺",  m0:128,charge:1,     hue:220, saturation:80, lightness:30, flavor:"tau",   isAnti:true,  strongCharge:0, weakCharge:1},
  anti_nu_e:    {name:"Anti-Eletrino",symbol:"ῡₑ", m0:1,     charge:0,     hue:170, saturation:80, lightness:30, flavor:"nue",   isAnti:true,  strongCharge:0, weakCharge:-1},
  anti_nu_mu:   {name:"Anti-Muonino",symbol:"ῡμ",m0:1, charge:0,     hue:180, saturation:80, lightness:30, flavor:"numu",  isAnti:true,  strongCharge:0, weakCharge:-1},
  anti_nu_tau:  {name:"Anti-Tauino",symbol:"ῡτ",m0:1, charge:0,     hue:190, saturation:80, lightness:30, flavor:"nutau", isAnti:true,  strongCharge:0, weakCharge:-1},
  
  // Quarks
  up:           {name:"Up",          symbol:"u",   m0:4,   charge:2/3,   hue:30, saturation:80, lightness:70, flavor:"up",    isAnti:false, strongCharge:1, weakCharge:1},
  down:         {name:"Down",        symbol:"d",   m0:8,   charge:-1/3,  hue:40,  lightness:70, flavor:"down",  isAnti:false, strongCharge:1, weakCharge:-1},
  charm:        {name:"Charm",       symbol:"c",   m0:64,  charge:2/3,   hue:50,  lightness:70, flavor:"charm", isAnti:false, strongCharge:1, weakCharge:1},
  strange:      {name:"Strange",     symbol:"s",   m0:16,    charge:-1/3,  hue:60,  lightness:70, flavor:"strange",isAnti:false, strongCharge:1, weakCharge:-1},
  top:          {name:"Top",         symbol:"t",   m0:4096,charge:2/3,   hue:70,  lightness:70, flavor:"top",   isAnti:false, strongCharge:1, weakCharge:1},
  bottom:       {name:"Bottom",      symbol:"b",   m0:256,  charge:-1/3,  hue:80,  lightness:70, flavor:"bottom",isAnti:false, strongCharge:1, weakCharge:-1},
  
  // Antiquarks
  antiup:       {name:"Anti-Up",     symbol:"ū",   m0:4,   charge:-2/3,  hue:30,  lightness:30, flavor:"up",    isAnti:true,  strongCharge:1, weakCharge:-1},
  antidown:     {name:"Anti-Down",   symbol:"d̄",   m0:8,   charge:1/3,   hue:40,  lightness:30, flavor:"down",  isAnti:true,  strongCharge:1, weakCharge:1},
  anticharm:    {name:"Anti-Charm",  symbol:"c̄",   m0:64,  charge:-2/3,  hue:50,  lightness:30, flavor:"charm", isAnti:true,  strongCharge:1, weakCharge:-1},
  antistrange:  {name:"Anti-Strange",symbol:"s̄",   m0:16,    charge:1/3,   hue:60,  lightness:30, flavor:"strange",isAnti:true,  strongCharge:1, weakCharge:1},
  antitop:      {name:"Anti-Top",    symbol:"t̄",   m0:4096,charge:-2/3,  hue:70,  lightness:30, flavor:"top",   isAnti:true,  strongCharge:1, weakCharge:-1},
  antibottom:   {name:"Anti-Bottom", symbol:"b̄",   m0:256,  charge:1/3,   hue:80,  lightness:30, flavor:"bottom",isAnti:true,  strongCharge:1, weakCharge:1},
  
  // Bósons
  photon:       {name:"Fóton",       symbol:"γ",   m0:0,     charge:0,     hue:275, saturation:80, lightness:50, flavor:"photon", isAnti:false, strongCharge:0, weakCharge:0},
  gluon:        {name:"Gluon",       symbol:"g",   m0:0,     charge:0,     hue:120, saturation:80, lightness:50, flavor:"gluon",  isAnti:false, strongCharge:0, weakCharge:0},
  wplus:        {name:"W⁺",          symbol:"W⁺",  m0:512, charge:1,     hue:300, saturation:80, lightness:70, flavor:"w",     isAnti:false, strongCharge:0, weakCharge:0},
  wminus:       {name:"W⁻",          symbol:"W⁻",  m0:512, charge:-1,    hue:300, saturation:80, lightness:30, flavor:"w",     isAnti:true,  strongCharge:0, weakCharge:0},
  z:            {name:"Z⁰",          symbol:"Z⁰",   m0:1024,charge:0,   hue:310, saturation:80, lightness:50, flavor:"z",     isAnti:false, strongCharge:0, weakCharge:0},
  higgs:        {name:"Higgs",       symbol:"H",   m0:2048,charge:0,   hue:320, saturation:80, lightness:50, flavor:"higgs", isAnti:false, strongCharge:0, weakCharge:0},
  graviton:     {name:"Gráviton",    symbol:"G",   m0:0,     charge:0,     hue:280, saturation:80, lightness:50, flavor:"graviton",isAnti:false, strongCharge:0, weakCharge:0},
  hadron:       {name:"Hadrão",      symbol:"H*",  m0:1000,  charge:0,     hue:100, saturation:80, lightness:70, flavor:"hadron", isAnti:false, strongCharge:0, weakCharge:0},};

// Lista de chaves para uso aleatório
const PARTICLE_KEYS = Object.keys(PARTICLE_DEFS);
