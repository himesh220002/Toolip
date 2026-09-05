export interface ToolSeoInfo {
  id: string;
  primaryKeyword: string;
  supportingKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  articleContent: {
    heading: string;
    paragraphs: string[];
    useCases: string[];
    howToSteps: string[];
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const DEFAULT_SITE_CONFIG = {
  name: 'Toolip',
  domain: 'toolip.app',
  baseUrl: 'https://toolip.app',
  tagline: '31+ Free Client-Side Utilities & Productivity Tools',
  description:
    'Toolip is a 100% private, client-side web utility platform. Convert PDFs, format JSON, split bills, compress images, and generate invoices with zero server uploads and total privacy.',
};

export const TOOL_SEO_DATA: Record<string, ToolSeoInfo> = {
  'bill-splitter': {
    id: 'bill-splitter',
    primaryKeyword: 'bill splitter calculator',
    supportingKeywords: [
      'portion based bill splitter',
      'itemized bill splitter online',
      'split bill with tip',
      'group expense split',
      'restaurant bill splitter',
      'fair bill split calculator'
    ],
    metaTitle: 'Free Online Bill Splitter — Equal & Portion-Based Itemized Splitter | Toolip',
    metaDescription:
      'Calculate fair group expense splits with our free online bill splitter. Supports portion-based item mapping, tip percentage calculation, and individual private share exports.',
    articleContent: {
      heading: 'The Ultimate Guide to Fair Portion-Based Bill Splitting',
      paragraphs: [
        'Splitting group restaurant bills or shared apartment expenses can quickly become awkward and frustrating when people order items of vastly different values. Traditional bill splitters simply divide the total cost equally, forcing guests who ordered a light salad to pay for another guest’s expensive steak or cocktail.',
        'Toolip’s Portion-Based Bill Splitter solves this exact problem. Designed around transparency and fairness, it allows you to assign specific purchased items to only the members who actually consumed them. When multiple members share an item (like a pizza or shared appetizer), the cost is divided proportionally among only those members.',
        'Additionally, tip amounts are calculated proportionally based on each person’s individual subtotal, ensuring that tip contributions remain 100% fair. Best of all, all calculations happen locally in your browser memory—no sign-up, no app downloads, and zero server logging.'
      ],
      useCases: [
        'Dining Out with Friends: Split dinner bills accurately without arguments over who drank what.',
        'Shared Apartment Utilities & Groceries: Divide roommate expenses and shared household purchases fairly.',
        'Group Trips & Vacations: Easily track hotel, gas, and activity costs across travel companions.'
      ],
      howToSteps: [
        'Enter group member names (e.g. Alice, Bob, Charlie).',
        'Add purchased items with their prices and tap member badges to select who shared each item.',
        'Enter the total tip amount paid to automatically distribute tips proportionally.',
        'Copy the full group summary or tap "Copy Only [Name]\'s Share" to send private individual payment requests.'
      ]
    },
    faqs: [
      {
        question: 'How does portion-based bill splitting work?',
        answer:
          'Portion-based splitting assigns individual item prices to only the group members who consumed them. If 3 out of 5 people share a $30 pizza, only those 3 people pay $10 each.'
      },
      {
        question: 'How is the tip amount divided among members?',
        answer:
          'Tips are divided proportionally based on each person’s consumed item subtotal. If a member consumed 30% of the food, they contribute 30% of the tip.'
      },
      {
        question: 'Can I send an individual member their bill share privately?',
        answer:
          'Yes! Every person’s card has a dedicated "Copy Only [Name]\'s Share" button that generates a clean text containing only their items and total without revealing full group details.'
      },
      {
        question: 'Is my financial data uploaded to any server?',
        answer:
          'No. Toolip operates 100% client-side inside your browser DOM. No data is ever sent to any remote server or stored in a database.'
      }
    ]
  },
  'json-formatter': {
    id: 'json-formatter',
    primaryKeyword: 'json formatter online',
    supportingKeywords: [
      'json validator',
      'json beautifier',
      'prettify json online',
      'minify json',
      'json syntax repair',
      'json tree view',
      'json to yaml converter'
    ],
    metaTitle: 'Free JSON Formatter & Validator — Prettify, Minify & Repair JSON | Toolip',
    metaDescription:
      'Validate, prettify, minify, and repair JSON online. Features live syntax error highlighting, interactive tree inspector, auto-repair for trailing commas, and YAML export.',
    articleContent: {
      heading: 'Professional Online JSON Formatter, Validator & Tree Inspector',
      paragraphs: [
        'Working with API responses, configuration payloads, and complex data structures is a daily task for software engineers and web developers. Unformatted, single-line minified JSON strings are virtually unreadable to the human eye, making debugging unnecessarily tedious.',
        'Toolip’s JSON Formatter & Validator is engineered for lightning-fast performance and maximum usability. It parses, validates, and formats JSON data instantly as you type. If your JSON contains common syntax errors—such as single quotes, trailing commas, or JavaScript comments—our 1-click Auto-Repair engine automatically fixes the code.',
        'Engineers can also toggle into the Interactive Tree View to expand and collapse nested object keys, or convert JSON payloads directly into clean YAML format for Kubernetes or CI/CD pipelines.'
      ],
      useCases: [
        'API Debugging: Format raw JSON payloads from REST APIs or Webhooks to instantly inspect data keys.',
        'Syntax Error Repair: Fix invalid trailing commas and unquoted keys in legacy configuration files.',
        'JSON to YAML Conversion: Convert JSON objects into clean YAML markup for DevOps configs.'
      ],
      howToSteps: [
        'Paste your raw, minified, or unformatted JSON text into the input editor.',
        'Enable "Auto-Format on Type" or click "Prettify / Format" to view clean indentation.',
        'Switch between "JSON Code", "Tree Inspector", and "YAML Export" views.',
        'Click "Auto-Repair JSON" if your input contains syntax errors like single quotes or trailing commas.'
      ]
    },
    faqs: [
      {
        question: 'How do I fix JSON trailing commas or single quotes?',
        answer:
          'Click the "Auto-Repair JSON" button in Toolip. It automatically replaces single quotes with double quotes, removes trailing commas, and strips JS comments.'
      },
      {
        question: 'Is my JSON data safe and private when formatting?',
        answer:
          'Yes, 100%. Toolip parses JSON locally using browser JavaScript V8 engine. Your code never leaves your computer and is never sent to external servers.'
      },
      {
        question: 'Can I format large JSON files with thousands of lines?',
        answer:
          'Yes. Because processing happens natively on your machine, Toolip can format multi-megabyte JSON payloads with sub-millisecond speeds.'
      }
    ]
  },
  'image-to-pdf': {
    id: 'image-to-pdf',
    primaryKeyword: 'image to pdf converter',
    supportingKeywords: [
      'jpg to pdf converter',
      'png to pdf online',
      'photo to pdf studio',
      'convert pictures to pdf free',
      'combine images into one pdf'
    ],
    metaTitle: 'Image to PDF Converter Studio — Convert JPG, PNG to PDF | Toolip',
    metaDescription:
      'Convert PNG, JPG, and WEBP images into clean, formatted PDFs. Features drag-and-drop reordering, margin sliders, corner roundness controls, and instant PDF download.',
    articleContent: {
      heading: 'High-Performance Client-Side Image to PDF Converter Studio',
      paragraphs: [
        'Converting scanned receipts, ID cards, document photos, or design mocks into professional PDF documents is an essential daily requirement for professionals, students, and businesses.',
        'Toolip Image to PDF Converter Studio provides a complete document preparation suite right in your browser. Drag and drop multiple images, reorder pages, adjust page orientations (Portrait vs Landscape), customize page sizes (A4, Letter, Legal), and fine-tune image margins and corner roundness with interactive sliders.',
        'Unlike online converters that upload your confidential photos to remote cloud servers, Toolip processes all image-to-PDF conversions locally using pdf-lib and HTML5 Canvas API.'
      ],
      useCases: [
        'Document Digitization: Combine scanned document pages or receipts into a single organized PDF.',
        'Portfolio Creation: Convert design mockups and photography images into clean PDF portfolios.',
        'Official Submissions: Format ID card photos into standard A4 PDF documents for online forms.'
      ],
      howToSteps: [
        'Upload your image files (JPG, PNG, WEBP, SVG).',
        'Drag and drop image tiles to reorder pages or use 1-click A-Z sorting.',
        'Customize page sizes (A4, Letter), margins, and corner roundness.',
        'Click "Export PDF" to generate and download your PDF document instantly.'
      ]
    },
    faqs: [
      {
        question: 'Can I combine multiple JPG and PNG images into a single PDF?',
        answer:
          'Yes! You can upload multiple images at once, reorder pages with drag-and-drop, and merge them into a single multi-page PDF.'
      },
      {
        question: 'Are my uploaded photos uploaded to any server?',
        answer:
          'No. All image parsing and PDF generation happen 100% locally in your browser memory.'
      }
    ]
  },
  'markdown-to-html': {
    id: 'markdown-to-html',
    primaryKeyword: 'markdown to html converter',
    supportingKeywords: [
      'md to html online',
      'markdown parser',
      'markdown to pdf converter',
      'github markdown previewer'
    ],
    metaTitle: 'Markdown to HTML Converter Studio — Real-Time MD Previewer | Toolip',
    metaDescription:
      'Convert Markdown to HTML & PDF in real-time. Supports GitHub Flavored Markdown, code syntax blocks, task lists, tables, theme presets, and 1-click PDF printing.',
    articleContent: {
      heading: 'Professional Markdown to HTML & PDF Converter Studio',
      paragraphs: [
        'Markdown is the undisputed standard for software documentation, GitHub READMEs, technical writing, and note-taking. However, publishing markdown content on websites or sharing formal reports requires converting MD files into styled HTML or PDF documents.',
        'Toolip Markdown to HTML Studio provides a real-time split-screen editor that converts your markdown syntax into clean HTML instantly. It supports GitHub Flavored Markdown (GFM), including task checkboxes, tables, code blocks, blockquotes, and custom CSS theme presets (GitHub Light, Dark Mode, Elegant Serif, Minimal Clean).',
        'You can copy raw HTML code, download static .HTML files, or print your formatted document to PDF with 1 click.'
      ],
      useCases: [
        'Technical Documentation: Preview and format GitHub README files before publishing.',
        'Blog & Content Creation: Convert markdown drafts into HTML markup for CMS platforms.',
        'Report Export: Convert markdown notes into styled PDF reports for clients and teams.'
      ],
      howToSteps: [
        'Type or paste your Markdown content into the source editor.',
        'Switch between "GitHub Light", "Dark Mode", and "Serif" themes.',
        'Click "Copy HTML", "Download .HTML", or "Convert to PDF".'
      ]
    },
    faqs: [
      {
        question: 'Does this converter support GitHub Flavored Markdown (GFM)?',
        answer:
          'Yes! Toolip supports tables, task list checkboxes ([x]), code blocks, blockquotes, strikethroughs (~~), and headers.'
      },
      {
        question: 'Can I export my Markdown directly as a PDF?',
        answer:
          'Yes. Click the "Convert to PDF" button to open a print-optimized window formatted specifically for A4 paper size.'
      }
    ]
  },
  'svg-code-editor': {
    id: 'svg-code-editor',
    primaryKeyword: 'svg code editor',
    supportingKeywords: [
      'svg preview online',
      'interactive svg editor',
      'svg minifier',
      'convert svg to png online'
    ],
    metaTitle: 'Interactive SVG Code Editor & Previewer — Export SVG & PNG | Toolip',
    metaDescription:
      'Live SVG code editor with bi-directional hover glow highlighting between code lines and preview shapes. Minify SVG code, change background canvas, and export as SVG or PNG.',
    articleContent: {
      heading: 'Interactive Bi-Directional SVG Code Editor & Minifier Studio',
      paragraphs: [
        'Scalable Vector Graphics (SVG) are essential for modern web development, icons, logos, and UI illustration. Editing SVG XML code manually can be challenging when trying to identify which `<path>`, `<circle>`, or `<rect>` tag corresponds to a visual shape.',
        'Toolip SVG Code Editor introduces bi-directional interactive element glowing. Hovering over a code line highlights the exact visual shape in the preview canvas, and clicking any visual shape glows its matching line in the source code.',
        'Features include built-in preset icon templates, 1-click SVG minification, background canvas color controls, and dual export to `.SVG` vector file or high-res `.PNG` raster image.'
      ],
      useCases: [
        'Icon & Logo Editing: Fine-tune paths, fills, strokes, and gradients on web icons.',
        'SVG Minification: Strip comments and unnecessary whitespace to reduce file byte size.',
        'SVG to PNG Conversion: Export vector artwork to high-resolution PNG images for presentations.'
      ],
      howToSteps: [
        'Paste SVG code or load a sample preset template (Badge, Illustration, Icon, Spinner).',
        'Click visual shapes to highlight code lines, or hover over line numbers to glow shapes.',
        'Click "Minify SVG" to clean up code.',
        'Click "Download .SVG" or "Export PNG" to save your graphics.'
      ]
    },
    faqs: [
      {
        question: 'How does bi-directional shape highlighting work?',
        answer:
          'Hovering over code line numbers pulses the rendered shape in the preview window. Clicking a shape in the preview window glows its exact XML code line.'
      },
      {
        question: 'Can I export my SVG as a PNG image?',
        answer:
          'Yes! Click "Export PNG" to render your vector graphic onto a high-resolution canvas and download it as a PNG file.'
      }
    ]
  },
  'unit-converter': {
    id: 'unit-converter',
    primaryKeyword: 'unit converter online',
    supportingKeywords: [
      'storage unit converter',
      'mach speed converter',
      'data rate converter',
      'surface area calculator',
      '3d shape volume calculator'
    ],
    metaTitle: 'Free Unit & Geometry Converter — Storage, Speed, Data Rate & 3D Shapes | Toolip',
    metaDescription:
      'Convert storage units (bits to petabytes), data transfer rates, speed (Mach to light speed), length, weight, temperature, and calculate 2D/3D shape surface areas & volumes.',
    articleContent: {
      heading: 'Comprehensive Engineering Unit & Geometry Shape Calculator',
      paragraphs: [
        'Engineers, developers, students, and scientists frequently need to perform precise unit conversions across computer storage, data transfer bandwidth, velocity, and 3D geometry.',
        'Toolip Unit & Geometry Converter provides a unified calculation engine. Convert digital storage metrics (bits, bytes, KB, MB, GB, TB, PB), network transfer bandwidth (bps, Mbps, Gbps), speeds (m/s, km/h, mph, Knot, Mach 1, Speed of Light $c$), and length/weight/temperature.',
        'The Geometry module features 14 2D and 3D shapes (Circle, Square, Triangle, Trapezium, Sphere, Cylinder, Cone, Cuboid) with exact formulas and automatic Surface Area and Volume calculations.'
      ],
      useCases: [
        'Data Rate & Bandwidth Planning: Calculate network file transfer times and storage needs.',
        'Scientific Speed Calculations: Convert Mach numbers and light speed values into meters per second.',
        '3D Surface Area & Volume: Find exact volumes of cylinders, cones, and spheres for engineering math.'
      ],
      howToSteps: [
        'Select a category: Length, Weight, Speed, Storage, Data Rate, Temperature, or Geometry.',
        'For units: Choose From and To units, enter your value, and click Swap or Copy.',
        'For geometry: Select a shape (Sphere, Cylinder, Cone, etc.) and enter radius or dimensions.'
      ]
    },
    faqs: [
      {
        question: 'What storage units are supported?',
        answer:
          'Bit, Byte, Kilobyte (KB), Megabyte (MB), Gigabyte (GB), Terabyte (TB), and Petabyte (PB).'
      },
      {
        question: 'Which geometric shapes can I calculate?',
        answer:
          '14 shapes: Circle, Square, Rectangle, Triangle, Pentagon, Hexagon, Octagon, Decagon, Trapezium, Cube, Cuboid, Sphere, Cylinder, and Cone.'
      }
    ]
  },
  'tip-calculator': {
    id: 'tip-calculator',
    primaryKeyword: 'mind map editor online',
    supportingKeywords: [
      'graphml editor',
      'mindmap builder',
      'interactive mind map creator',
      'mindmap graphml viewer',
      'yfiles graphml editor',
      'drag and drop mind map'
    ],
    metaTitle: 'Free Mind Map Editor — Interactive Node Builder & GraphML Creator | Toolip',
    metaDescription:
      'Build, edit, drag, and structure mind maps online. Features root & secondary node option toolbars, emoji icons, arrow colors, child collapsibility, and .graphml save & open.',
    articleContent: {
      heading: 'The Ultimate Guide to Interactive Mind Mapping with GraphML Support',
      paragraphs: [
        'Mind mapping is one of the most effective visual brainstorming techniques for organizing ideas, planning project architectures, and mapping complex relationships. Traditional drawing apps lack structural graph hierarchy, while rigid tools restrict custom colors, emojis, and edge routing.',
        'Toolip Mind Map Editor offers a professional-grade node-based graph builder right in your browser. Pan across an infinite grid, drag nodes freely, and click any node to access specialized control toolbars.',
        'Root nodes feature child collapsibility, emoji icons, connector arrow targets, and rapid node creation. Secondary nodes add edge color customization. You can export and import standard .graphml XML files (fully compatible with yFiles and desktop graph suites) with 1 click.'
      ],
      useCases: [
        'Brainstorming & Note Taking: Structure complex topics into clean hierarchical sub-branches.',
        'Architecture & Flow Design: Connect distant sub-nodes with custom colored arrows to show dependencies.',
        'GraphML File Preparation: Open, modify, and save .graphml diagram files seamlessly.'
      ],
      howToSteps: [
        'Click on any empty canvas area to create a root or secondary node.',
        'Click any node to open its floating options toolbar (Emoji, Edge Color, Collapse Children, Connector Arrow, Add Child).',
        'Double-click node text to edit labels, and drag nodes to adjust the diagram layout.',
        'Click "Save mindmap.graphml" to download your diagram or update the project graph file.'
      ]
    },
    faqs: [
      {
        question: 'How do I add new nodes to the canvas?',
        answer:
          'Click any empty space on the canvas to open the creation menu, or click the "+" button on any node toolbar to spawn a connected child.'
      },
      {
        question: 'Can I save and open .graphml files?',
        answer:
          'Yes! Click "Save mindmap.graphml" to download standard yFiles-compatible GraphML XML, or click "Open .graphml" to load any existing graph file.'
      },
      {
        question: 'How does child collapsibility work?',
        answer:
          'Clicking the collapse icon on a parent node toggles the visibility of its entire child subtree, helping you collapse dense branches for clarity.'
      }
    ]
  }
};

// Fallback SEO generator for any tool that doesn't have custom long-form content yet
export const getToolSeoData = (toolId: string, title: string, description: string, category: string): ToolSeoInfo => {
  if (TOOL_SEO_DATA[toolId]) {
    return TOOL_SEO_DATA[toolId];
  }

  const primaryKeyword = `${title.toLowerCase()} online`;
  return {
    id: toolId,
    primaryKeyword,
    supportingKeywords: [
      `${title.toLowerCase()} free`,
      `client-side ${title.toLowerCase()}`,
      `best ${title.toLowerCase()} tool`,
      `online ${category.toLowerCase()}`
    ],
    metaTitle: `${title} — Free Online Tool | Toolip`,
    metaDescription: `${description} 100% free, private, client-side web utility operating with zero server uploads on Toolip.`,
    articleContent: {
      heading: `Complete Guide to Using ${title} Online`,
      paragraphs: [
        `${title} is designed to solve daily productivity and workflow challenges with maximum speed, clarity, and ease.`,
        `Toolip provides a 100% client-side execution environment. All data processing occurs natively in your browser without uploading private files or personal inputs to remote servers.`,
        `Enjoy fast, reliable execution, custom options, local storage persistence, and 1-click export tools.`
      ],
      useCases: [
        `Daily Workflow Optimization: Perform tasks in seconds without software installation.`,
        `Privacy Protection: Process sensitive information with zero risk of server data leaks.`,
        `Cross-Device Compatibility: Access fully responsive controls on mobile, tablet, and desktop.`
      ],
      howToSteps: [
        `Access the ${title} interface above.`,
        `Input your parameters, text, or files.`,
        `Customize formatting or calculation settings.`,
        `Export or copy your final results with 1 click.`
      ]
    },
    faqs: [
      {
        question: `Is ${title} free to use?`,
        answer: `Yes, 100% free with no registration, accounts, or usage limits.`
      },
      {
        question: `Is my data kept private?`,
        answer: `Yes! All processing is executed locally in your browser memory. No data is sent to external servers.`
      }
    ]
  };
};
