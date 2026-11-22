declare module "virtual:deliverables" {
  /** File name in ./deliverables → base64 content. Empty outside the server bundle. */
  const files: Record<string, string>;
  export default files;
}
