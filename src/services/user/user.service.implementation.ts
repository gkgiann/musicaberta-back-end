import { User } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user/user.repository";
import { UserService } from "./user.service";

export class UserServiceImplementation implements UserService {
  private constructor(readonly repository: UserRepository) {}

  public static build(repository: UserRepository) {
    return new UserServiceImplementation(repository);
  }

  async create(
    name: string,
    email: string,
    avatarUrl: string
  ): Promise<User | null> {
    const aUser = User.build(name, email, avatarUrl);

    const result = await this.repository.save(aUser);

    return result;
  }

  async find(email: string): Promise<User | null> {
    const aUser = await this.repository.find(email);

    return aUser;
  }
}