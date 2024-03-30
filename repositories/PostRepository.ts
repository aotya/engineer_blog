import Repository from "./Repository";


class PostRepository {
  public getList(){
    return Repository(`
    posts {
      edges {
        node {
          id
          title
          date
          content
        }
      }
    }
  `).getWp();
  }
}

export default PostRepository;
