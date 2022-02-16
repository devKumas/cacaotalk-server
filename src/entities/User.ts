import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ChatUser } from './chatUser';
import { AutoDeleteDateEntity } from './Entity';

type gender = 'M' | 'F';

@Entity({ name: 'users' })
export class User extends AutoDeleteDateEntity {
  @Column('varchar', { name: 'email', unique: true, length: 30 })
  email?: string;

  @Column('varchar', { name: 'password', length: 50 })
  password?: string;

  @Column('varchar', { name: 'name', length: 10 })
  name?: string;

  @Column('varchar', { name: 'nick_name', length: 10 })
  nickName?: string;

  @Column('enum', { name: 'gender', enum: ['M', 'F'] })
  gender?: gender;

  @Column('varchar', { name: 'profile_image', length: 50 })
  profileImage?: string;

  @ManyToMany(() => User, (users) => users.User)
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
  User?: User[];

  @OneToMany(() => ChatUser, (chatusers) => chatusers.User)
  ChatUsers?: ChatUser;
}
