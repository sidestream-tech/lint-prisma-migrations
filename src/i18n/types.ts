/** Parsed flat-key locale object where dot-separated keys map to string values. */
export type FlatKeyLocaleData = Record<string, string>

/** A single conflict where a key is both a leaf value and a prefix of another key. */
export interface NamespaceConflict {
  /** The shorter key that holds a non-object value (e.g. `"expand"`). */
  leafKey: string
  /** Line number of the leaf key in the source file (1-based, undefined when not file-sourced). */
  leafKeyLine?: number
  /** The longer dotted key that treats the leaf as a namespace (e.g. `"expand.all"`). */
  conflictingDescendantKey: string
}

/** A locale entry whose value is not a string. */
export interface InvalidValueError {
  key: string
  actualType: string
  line?: number
}

/** Result of analyzing a single locale file for namespace conflicts and invalid values. */
export interface LocaleFileAnalysisResult {
  /** Absolute path to the analyzed file. */
  filePath: string
  /** Detected namespace conflicts (empty if none). */
  conflicts: NamespaceConflict[]
  /** Present when the file could not be read or parsed. */
  error?: string
  /** Non-string values detected in the file. */
  invalidValues: InvalidValueError[]
}
