import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { instanceToPlain, Exclude } from 'class-transformer';

/**
 * Représente un utilisateur dans le système.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  pseudonyme: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  name?: string;

  @Column('text', { nullable: true })
  adresse?: string;

  @Column('text', { nullable: true })
  commentaire?: string;

  @Column()
  role: 'admin' | 'user';

  /**
   * Convertit l'entité utilisateur en un objet JSON.
   * @returns Un objet JSON représentant l'utilisateur.
   */
  toJSON() {
    return instanceToPlain(this);
  }
}
