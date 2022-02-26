import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ChatUser } from './chatUser';
import { AutoDeleteDateEntity } from './Entity';
import bcrypt from 'bcrypt';
import { ChatContent } from './chatContent';

@Entity({ name: 'users' })
export class User extends AutoDeleteDateEntity {
  @Column('varchar', { name: 'email', unique: true, length: 30 })
  email?: string;

  @Column('varchar', { name: 'password', length: 100, select: false })
  password?: string;

  @Column('varchar', { name: 'name', length: 10 })
  name?: string;

  @Column('varchar', { name: 'gender' })
  gender?: string;

  @Column('varchar', { name: 'profile_image', length: 50, nullable: true })
  profileImage?: string | null;

  @Column('varchar', { name: 'refresh_token', length: 500, nullable: true, select: false })
  refreshToken?: string | null;

  @ManyToMany(() => User, (user) => user.Friends)
  @JoinTable({
    name: 'friends',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'target_id',
      referencedColumnName: 'id',
    },
  })
  Friends?: User[];

  @OneToMany(() => ChatUser, (chatUsers) => chatUsers.User)
  ChatUsers?: ChatUser[];

  @OneToMany(() => ChatContent, (chatContents) => chatContents.User)
  ChatContents?: ChatContent[];

  @BeforeInsert()
  async hashPassword() {
    this.password! = await bcrypt.hash(this.password!, 10);
  }

  async comparePassword(unencryptedPassword: string): Promise<boolean> {
    return await bcrypt.compare(unencryptedPassword, this.password!);
  }
}
