export default {
  async search(api) {
    const res = await api.search("test");
    if (!Array.isArray(res)) {
      throw new Error("search must return array");
    }
  }
};
