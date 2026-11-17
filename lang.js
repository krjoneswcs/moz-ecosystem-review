// ── Translations ───────────────────────────────────────────────────────
// Usage: T('key') returns the string in the current language.
// setLang('pt') / setLang('en') switches language and re-renders all
// [data-i18n] elements plus any registered dynamic callbacks.

// Load saved language preference, default to 'en'
window.CURRENT_LANG = (function() {
  try { return localStorage.getItem('moz_lang') || 'en'; } catch(e) { return 'en'; }
})();

const TRANSLATIONS = {
  en: {
    // ── Shared ──────────────────────────────────────────────────────
    'back_to_tools':        '← Back to tools',
    'lang_toggle':          'PT',
    'layers':               'Layers',
    'provincial_boundaries':'Provincial boundaries',
    'district_boundaries':  'District boundaries',
    'all_ecosystems':       'All ecosystem types',
    'your_name':            'Your name',
    'your_name_placeholder':'e.g. Jane Smith',
    'leave_feedback':       'Leave feedback',
    'ecosystem_label':      'Ecosystem',
    'category_label':       'Category',
    'comment_label':        'Comment',
    'submit':               'Submit',
    'cancel':               'Cancel',
    'general_comment':      'General comment',
    'describe_placeholder': 'Describe what you\'re seeing…',

    // ── Reference site sidebar ────────────────────────────────────
    'ref_title':            'Ecosystem Reference Site Review',
    'ref_subtitle':         'Mozambique · Expert review map',
    'how_works':            'How does this work?',
    'focus_header':         'Focus on an ecosystem type',
    'ecosystem_type_label': 'Ecosystem type',
    'all_eco_types':        'All ecosystem types',
    'eco_boundaries':       'Ecosystem boundaries',
    'eco_labels':           'Ecosystem labels',
    'ref_site_patches':     'Reference site patches',
    'dist_disturbance':     'Distance to disturbance',
    'your_feedback':        'Your submitted feedback',
    'no_feedback':          'No feedback submitted yet this session.',
    'broad_category':       'Broad Category',

    // ── Reference site modal ──────────────────────────────────────
    'modal_welcome':        'Welcome to the Ecosystem Reference Site Review',
    'modal_subtitle':       'Mozambique · AlphaEarth biomass model',
    'modal_step1_title':    'Qualifying ecosystems',
    'modal_step1_body':     '<b>Coloured</b> ecosystems have reference sites with significantly higher biomass than the surrounding disturbed landscape — these are our validated reference ecosystems. <b>Dark grey</b> ecosystems did not qualify. Click any polygon to see details.',
    'modal_step2_title':    'Reference site patches',
    'modal_step2_body':     'Hatched areas within each qualifying ecosystem show the actual reference site patches — the least-disturbed areas used to establish biomass baselines.',
    'modal_draw_title':     '✏️ How to leave feedback',
    'modal_draw_body':      'Use the shape icons (square, line, or point) in the top-left corner of the map to draw around any area you want to comment on. A form will appear for you to describe what you\'re seeing.',
    'modal_btn':            'Got it — let me explore',

    // ── Draw callout ──────────────────────────────────────────────
    'callout_text':         '<b>Drawing tools</b> — use the shape icons (square, line, or point) in the top-left corner of the map to mark an area and leave feedback.',

    // ── Feedback form (reference sites) ──────────────────────────
    'fb_form_title':        'Leave feedback',
    'fb_eco_label':         'Ecosystem type(s) this relates to',
    'fb_category_label':    'What kind of issue is this?',
    'fb_cat_disturbed':     'This reference site looks disturbed or atypical',
    'fb_cat_missing':       'This area should be a reference site but isn\'t',
    'fb_comment_label':     'Describe what you\'re seeing',
    'fb_placeholder':       'What looks wrong, and why?',
    'fb_submit':            'Submit feedback',

    // ── Fire explorer sidebar ─────────────────────────────────────
    'fire_title':           'Mozambique Fire Severity Explorer',
    'fire_subtitle':        'GABAM Landsat fire count 2001–2021 · 500 m',
    'fire_layer':           'Fire frequency layer',
    'fire_thresholds':      'Fire class thresholds',
    'thresh_label_1':       'Unburned/Low  →  Moderate',
    'thresh_label_2':       'Moderate  →  High',
    'thresh_label_3':       'High  →  Very High',
    'thresh_label_4':       'Very High  →  Extreme',
    'class_breakdown':      'Class breakdown',
    'select_eco_stats':     'Select an ecosystem to see area statistics.',
    'agb_section':          'Biomass by fire class',
    'agb_note':             'Median AGB (Mg/ha) · error bars = IQR · AlphaEarth 2022',
    'fire_data_note':       'Fire count = number of times a pixel burned 2001–2021 (GABAM 30 m Landsat, resampled to 1 km for display). Histograms computed at 100 m. Thresholds define class boundaries; defaults match the RLE assessment analysis.',
    'feedback_section':     'Feedback',
    'feedback_btn':         '✉ Leave feedback on this ecosystem',
    'map_feedback_btn':     '✉ Leave feedback',

    // ── Fire feedback panel ───────────────────────────────────────
    'fire_fb_title':        'Leave feedback',
    'fire_fb_name':         'Your name',
    'fire_fb_eco':          'Ecosystem',
    'fire_fb_category':     'Category',
    'fire_fb_comment':      'Comment',
    'fire_fb_cat1':         'Fire class thresholds look wrong for this ecosystem',
    'fire_fb_cat2':         'Biomass pattern looks unexpected',
    'fire_fb_cat3':         'This ecosystem should not qualify',

    // ── Fire modal ────────────────────────────────────────────────
    'fire_modal_title':     'Mozambique Fire Severity Explorer',
    'fire_modal_sub':       'GABAM Landsat fire count 2001–2021 · 91 ecosystem types · AlphaEarth AGB 2022',
    'fire_step1_title':     'Biomass–fire test',
    'fire_step1_body':      'Each ecosystem shown here has a statistically significant difference in aboveground biomass between unburned and frequently-burned areas — confirming that fire frequency meaningfully predicts biomass condition within that ecosystem type.',
    'fire_step2_title':     'Climate similarity test',
    'fire_step2_body':      'Areas with different fire frequencies are climatically similar within each ecosystem — ensuring that observed biomass differences across fire classes reflect fire regime, not underlying climate gradients.',
    'fire_modal_note':      '<strong>What this means:</strong> Only ecosystem types passing both tests are included. For these, fire frequency can serve as a credible proxy for ecosystem condition.',
    'fire_modal_btn':       'Explore the data →',

    // ── Fire map gradient label ───────────────────────────────────
    'fire_classes_label':   'Fire frequency classes',

    // ── Landing page ──────────────────────────────────────────────
    'landing_wcs_label':    'Wildlife Conservation Society · SBAPP · Mozambique',
    'landing_title':        'Ecosystem Analysis Tools',
    'landing_sub':          "Spatial analysis of ecosystem condition and fire regimes across Mozambique's qualifying ecosystem types",
    'landing_ref_label':    'Reference Site Review',
    'landing_ref_title':    'Ecosystem Reference Sites',
    'landing_ref_desc':     'Explore qualifying ecosystems and their reference site patches — the least-disturbed areas used to establish biomass baselines. Leave expert feedback on boundaries and site selection.',
    'landing_ref_meta1':    '69 qualifying ecosystem types',
    'landing_ref_meta2':    'AlphaEarth AGB 2022 · Distance to disturbance',
    'landing_ref_meta3':    'Expert review & feedback tool',
    'landing_ref_cta':      'Open reference site review',
    'landing_fire_label':   'Fire Severity Explorer',
    'landing_fire_title':   'Fire Frequency Analysis',
    'landing_fire_desc':    'Explore GABAM Landsat fire count data across ecosystem types. Filter by ecosystem, adjust fire class thresholds, and view aboveground biomass by fire frequency class.',
    'landing_fire_meta1':   'GABAM fire count 2001–2021 · 500 m',
    'landing_fire_meta2':   'Biomass by fire class · AlphaEarth AGB 2022',
    'landing_fire_meta3':   'Adjustable fire class thresholds',
    'landing_fire_cta':     'Open fire explorer',
    'landing_footer':       'Mozambique SBAPP · WCS · Data: GABAM, AlphaEarth, IUCN GET',
  },

  pt: {
    // ── Shared ──────────────────────────────────────────────────────
    'back_to_tools':        '← Voltar às ferramentas',
    'lang_toggle':          'EN',
    'layers':               'Camadas',
    'provincial_boundaries':'Limites provinciais',
    'district_boundaries':  'Limites distritais',
    'all_ecosystems':       'Todos os tipos de ecossistemas',
    'your_name':            'O seu nome',
    'your_name_placeholder':'ex. João Silva',
    'leave_feedback':       'Deixar comentário',
    'ecosystem_label':      'Ecossistema',
    'category_label':       'Categoria',
    'comment_label':        'Comentário',
    'submit':               'Submeter',
    'cancel':               'Cancelar',
    'general_comment':      'Comentário geral',
    'describe_placeholder': 'Descreva o que está a ver…',

    // ── Reference site sidebar ────────────────────────────────────
    'ref_title':            'Revisão de Sítios de Referência de Ecossistemas',
    'ref_subtitle':         'Moçambique · Mapa de revisão especializada',
    'how_works':            'Como funciona?',
    'focus_header':         'Focar num tipo de ecossistema',
    'ecosystem_type_label': 'Tipo de ecossistema',
    'all_eco_types':        'Todos os tipos de ecossistemas',
    'eco_boundaries':       'Limites dos ecossistemas',
    'eco_labels':           'Etiquetas dos ecossistemas',
    'ref_site_patches':     'Parcelas de sítios de referência',
    'dist_disturbance':     'Distância à perturbação',
    'your_feedback':        'Os seus comentários submetidos',
    'no_feedback':          'Nenhum comentário submetido nesta sessão.',
    'broad_category':       'Categoria Principal',

    // ── Reference site modal ──────────────────────────────────────
    'modal_welcome':        'Bem-vindo à Revisão de Sítios de Referência de Ecossistemas',
    'modal_subtitle':       'Moçambique · Modelo de biomassa AlphaEarth',
    'modal_step1_title':    'Ecossistemas qualificados',
    'modal_step1_body':     'Os ecossistemas a <b>cores</b> têm sítios de referência com biomassa significativamente superior à da paisagem perturbada circundante — estes são os nossos ecossistemas de referência validados. Os ecossistemas a <b>cinzento escuro</b> não foram qualificados. Clique em qualquer polígono para ver os detalhes.',
    'modal_step2_title':    'Parcelas de sítios de referência',
    'modal_step2_body':     'As áreas com padrão xadrez dentro de cada ecossistema qualificado mostram as parcelas dos sítios de referência — as áreas menos perturbadas utilizadas para estabelecer as linhas de base de biomassa.',
    'modal_draw_title':     '✏️ Como deixar comentários',
    'modal_draw_body':      'Utilize os ícones de forma (quadrado, linha ou ponto) no canto superior esquerdo do mapa para desenhar à volta de qualquer área sobre a qual pretende comentar. Aparecerá um formulário para descrever o que está a ver.',
    'modal_btn':            'Entendido — vou explorar',

    // ── Draw callout ──────────────────────────────────────────────
    'callout_text':         '<b>Ferramentas de desenho</b> — utilize os ícones de forma (quadrado, linha ou ponto) no canto superior esquerdo do mapa para marcar uma área e deixar comentários.',

    // ── Feedback form (reference sites) ──────────────────────────
    'fb_form_title':        'Deixar comentário',
    'fb_eco_label':         'Tipo(s) de ecossistema relacionado(s)',
    'fb_category_label':    'Que tipo de problema é este?',
    'fb_cat_disturbed':     'Este sítio de referência parece perturbado ou atípico',
    'fb_cat_missing':       'Esta área deveria ser um sítio de referência mas não é',
    'fb_comment_label':     'Descreva o que está a ver',
    'fb_placeholder':       'O que parece errado e porquê?',
    'fb_submit':            'Submeter comentário',

    // ── Fire explorer sidebar ─────────────────────────────────────
    'fire_title':           'Explorador de Severidade de Incêndios de Moçambique',
    'fire_subtitle':        'Contagem de incêndios GABAM Landsat 2001–2021 · 500 m',
    'fire_layer':           'Camada de frequência de incêndios',
    'fire_thresholds':      'Limiares das classes de incêndio',
    'thresh_label_1':       'Não queimado/Baixo  →  Moderado',
    'thresh_label_2':       'Moderado  →  Elevado',
    'thresh_label_3':       'Elevado  →  Muito Elevado',
    'thresh_label_4':       'Muito Elevado  →  Extremo',
    'class_breakdown':      'Distribuição por classes',
    'select_eco_stats':     'Selecione um ecossistema para ver estatísticas de área.',
    'agb_section':          'Biomassa por classe de incêndio',
    'agb_note':             'AGB mediana (Mg/ha) · barras de erro = IQR · AlphaEarth 2022',
    'fire_data_note':       'Contagem de incêndios = número de vezes que um pixel ardeu entre 2001–2021 (GABAM Landsat 30 m, reamostrado para 1 km para visualização). Histogramas calculados a 100 m. Os limiares definem os limites das classes; os valores predefinidos correspondem à análise de avaliação RLE.',
    'feedback_section':     'Comentários',
    'feedback_btn':         '✉ Deixar comentário sobre este ecossistema',
    'map_feedback_btn':     '✉ Deixar comentário',

    // ── Fire feedback panel ───────────────────────────────────────
    'fire_fb_title':        'Deixar comentário',
    'fire_fb_name':         'O seu nome',
    'fire_fb_eco':          'Ecossistema',
    'fire_fb_category':     'Categoria',
    'fire_fb_comment':      'Comentário',
    'fire_fb_cat1':         'Os limiares das classes de incêndio parecem incorretos para este ecossistema',
    'fire_fb_cat2':         'O padrão de biomassa parece inesperado',
    'fire_fb_cat3':         'Este ecossistema não deveria ser qualificado',

    // ── Fire modal ────────────────────────────────────────────────
    'fire_modal_title':     'Explorador de Severidade de Incêndios de Moçambique',
    'fire_modal_sub':       'Contagem de incêndios GABAM Landsat 2001–2021 · 91 tipos de ecossistemas · AGB AlphaEarth 2022',
    'fire_step1_title':     'Teste biomassa–incêndio',
    'fire_step1_body':      'Cada ecossistema aqui apresentado tem uma diferença estatisticamente significativa na biomassa aérea entre áreas não queimadas e frequentemente queimadas — confirmando que a frequência de incêndios é um preditor significativo da condição de biomassa dentro desse tipo de ecossistema.',
    'fire_step2_title':     'Teste de similaridade climática',
    'fire_step2_body':      'Áreas com diferentes frequências de incêndio são climaticamente similares dentro de cada ecossistema — garantindo que as diferenças de biomassa observadas entre as classes de incêndio reflitam o regime de fogo e não os gradientes climáticos subjacentes.',
    'fire_modal_note':      '<strong>O que isto significa:</strong> Apenas os tipos de ecossistemas que passam ambos os testes estão incluídos. Para estes, a frequência de incêndios pode servir como um indicador credível da condição do ecossistema.',
    'fire_modal_btn':       'Explorar os dados →',

    // ── Fire map gradient label ───────────────────────────────────
    'fire_classes_label':   'Classes de frequência de incêndios',

    // ── Landing page ──────────────────────────────────────────────
    'landing_wcs_label':    'Wildlife Conservation Society · SBAPP · Moçambique',
    'landing_title':        'Ferramentas de Análise de Ecossistemas',
    'landing_sub':          'Análise espacial das condições dos ecossistemas e dos regimes de incêndio nos tipos de ecossistemas qualificados de Moçambique',
    'landing_ref_label':    'Revisão de Sítios de Referência',
    'landing_ref_title':    'Sítios de Referência de Ecossistemas',
    'landing_ref_desc':     'Explore os ecossistemas qualificados e as suas parcelas de sítios de referência — as áreas menos perturbadas utilizadas para estabelecer as linhas de base de biomassa. Deixe comentários especializados sobre os limites e a seleção de sítios.',
    'landing_ref_meta1':    '69 tipos de ecossistemas qualificados',
    'landing_ref_meta2':    'AGB AlphaEarth 2022 · Distância à perturbação',
    'landing_ref_meta3':    'Ferramenta de revisão especializada e comentários',
    'landing_ref_cta':      'Abrir revisão de sítios de referência',
    'landing_fire_label':   'Explorador de Severidade de Incêndios',
    'landing_fire_title':   'Análise de Frequência de Incêndios',
    'landing_fire_desc':    'Explore dados de contagem de incêndios GABAM Landsat por tipo de ecossistema. Filtre por ecossistema, ajuste os limiares das classes de incêndio e visualize a biomassa aérea por classe de frequência de incêndios.',
    'landing_fire_meta1':   'Contagem de incêndios GABAM 2001–2021 · 500 m',
    'landing_fire_meta2':   'Biomassa por classe de incêndio · AGB AlphaEarth 2022',
    'landing_fire_meta3':   'Limiares de classes de incêndio ajustáveis',
    'landing_fire_cta':     'Abrir explorador de incêndios',
    'landing_footer':       'SBAPP Moçambique · WCS · Dados: GABAM, AlphaEarth, IUCN GET',
  }
};

function T(key) {
  const lang = window.CURRENT_LANG || 'en';
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS['en'][key] || key;
}

const _langCallbacks = [];

function onLangChange(cb) {
  _langCallbacks.push(cb);
}

function setLang(code) {
  window.CURRENT_LANG = code;
  document.documentElement.lang = code;
  try { localStorage.setItem('moz_lang', code); } catch(e) {}

  // Update all static data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = T(key);
    if (el.tagName === 'INPUT' && el.type !== 'checkbox') {
      el.placeholder = val;
    } else if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  // Update toggle button label
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.textContent = T('lang_toggle');
  });

  // Fire registered dynamic callbacks (for JS-generated content)
  _langCallbacks.forEach(cb => cb(code));
}
