declare module 'react-twemoji' {
  import { ComponentType, ReactNode } from 'react'

  interface TwemojiProps {
    children?: ReactNode
    options?: {
      className?: string
      folder?: string
      ext?: string
      base?: string
    }
    tag?: string
    className?: string
  }

  const Twemoji: ComponentType<TwemojiProps>
  export default Twemoji
}
