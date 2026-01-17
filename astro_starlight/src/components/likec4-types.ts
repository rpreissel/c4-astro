/**
 * Shared type definitions and default values for LikeC4 view components.
 */

export type PaddingWithUnit = `${number}px` | `${number}%` | number

export type ViewPadding = PaddingWithUnit | {
  top?: PaddingWithUnit
  right?: PaddingWithUnit
  bottom?: PaddingWithUnit
  left?: PaddingWithUnit
  x?: PaddingWithUnit
  y?: PaddingWithUnit
}

export type BackgroundPattern = 'dots' | 'lines' | 'cross' | 'transparent' | 'solid'

export interface BrowserProps {
  background?: BackgroundPattern
  fitViewPadding?: PaddingWithUnit
  controls?: boolean
  showNavigationButtons?: boolean
  enableSearch?: boolean
  enableFocusMode?: boolean
  enableDynamicViewWalkthrough?: boolean
  dynamicViewVariant?: 'diagram' | 'sequence'
  enableElementDetails?: boolean
  enableRelationshipBrowser?: boolean
  enableRelationshipDetails?: boolean
  enableElementTags?: boolean
  enableNotations?: boolean
  enableCompareWithLatest?: boolean
  reduceGraphics?: 'auto' | boolean
}

export interface LikeC4ViewProps<TViewId = string> {
  /**
   * The view ID
   */
  viewId: TViewId

  /**
   * Enable/disable panning
   * @default false
   */
  pannable?: boolean

  /**
   * Enable/disable zooming
   * @default false
   */
  zoomable?: boolean

  /**
   * Keep aspect ratio of the view
   * @default true
   */
  keepAspectRatio?: boolean

  /**
   * Background pattern
   * @default 'transparent'
   */
  background?: BackgroundPattern

  /**
   * Show/hide panel with top left controls
   * @default false
   */
  controls?: boolean

  /**
   * If set, initial viewport will show all nodes & edges
   * @default true
   */
  fitView?: boolean

  /**
   * Padding around the diagram (number - pixels, or string like '16px' or '5%')
   * Can also be an object with top/right/bottom/left or x/y properties
   * @default 16
   */
  fitViewPadding?: ViewPadding

  /**
   * Show back/forward navigation buttons in controls panel
   * @default false
   */
  showNavigationButtons?: boolean

  /**
   * Display notations of the view
   * @default false
   */
  enableNotations?: boolean

  /**
   * If double click on a node should enable focus mode, i.e. highlight incoming/outgoing edges
   * @default false
   */
  enableFocusMode?: boolean

  /**
   * If Walkthrough for dynamic views should be enabled
   * @default false
   */
  enableDynamicViewWalkthrough?: boolean

  /**
   * Default dynamic view display variant
   * @default 'diagram'
   */
  dynamicViewVariant?: 'diagram' | 'sequence'

  /**
   * Enable modal with element details
   * @default false
   */
  enableElementDetails?: boolean

  /**
   * Display element tags in the bottom left corner
   * @default false
   */
  enableElementTags?: boolean

  /**
   * Display dropdown with details on relationship's label click
   * @default false
   */
  enableRelationshipDetails?: boolean

  /**
   * Experimental feature to browse relationships
   * @default enableRelationshipDetails
   */
  enableRelationshipBrowser?: boolean

  /**
   * Improve performance by hiding certain elements and reducing visual effects
   * @default 'auto'
   */
  reduceGraphics?: 'auto' | boolean

  /**
   * Click on the view opens a modal with browser.
   * You can customize or disable the browser.
   * @default true
   */
  browser?: boolean | BrowserProps

  /**
   * Color scheme
   * @default - determined by user's system preferences
   */
  colorScheme?: 'light' | 'dark'

  /**
   * LikeC4 views use 'IBM Plex Sans' font.
   * By default, component injects the CSS to document head.
   * Set to false if you want to handle the font yourself.
   * @default true
   */
  injectFontCss?: boolean
}

/**
 * Extract props with defaults from Astro.props.
 * Returns props compatible with LikeC4View React component.
 */
export function extractPropsWithDefaults<TViewId>(props: LikeC4ViewProps<TViewId>): Required<Omit<LikeC4ViewProps<TViewId>, 'colorScheme'>> & Pick<LikeC4ViewProps<TViewId>, 'colorScheme'> {
  const {
    viewId,
    pannable = false,
    zoomable = false,
    keepAspectRatio = true,
    background = 'transparent' as const,
    controls = false,
    fitView = true,
    fitViewPadding = 16 as ViewPadding,
    showNavigationButtons = false,
    enableNotations = false,
    enableFocusMode = false,
    enableDynamicViewWalkthrough = false,
    dynamicViewVariant = 'diagram' as const,
    enableElementDetails = false,
    enableElementTags = false,
    enableRelationshipDetails = false,
    enableRelationshipBrowser = enableRelationshipDetails,
    reduceGraphics = 'auto' as const,
    browser = true,
    colorScheme,
    injectFontCss = true,
  } = props

  return {
    viewId,
    pannable,
    zoomable,
    keepAspectRatio,
    background,
    controls,
    fitView,
    fitViewPadding,
    showNavigationButtons,
    enableNotations,
    enableFocusMode,
    enableDynamicViewWalkthrough,
    dynamicViewVariant,
    enableElementDetails,
    enableElementTags,
    enableRelationshipDetails,
    enableRelationshipBrowser,
    reduceGraphics,
    browser,
    colorScheme,
    injectFontCss,
  }
}
