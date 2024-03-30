import RepositoryFactory from "../repositories/RepositoryFactory";


class PostService {
  public async gentlest(){
    const res = await RepositoryFactory.post.getList();
    return res;
  }

}

export default PostService ;