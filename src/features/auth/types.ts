import type { UUID } from "@/utils/global";

export type RegisterInfo = {
  displayName: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  id: UUID;
};

export type LoginInfo = {
  email: string;
  password: string;
};

export type LoginResponse = {
    token: string;
}