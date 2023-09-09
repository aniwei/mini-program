import { useState, useEffect, useCallback } from 'react'
import { TextInput } from 'react-native'
import { useProgram } from '@stores/program'
import { TextInputPayload } from '@catalyze/wx'

export interface TextInputProps {
  style: {
    position: 'absolute' | 'relative',
    left: number,
    top: number
  },
  placeholder: string,
  placeholderTextColor: string,
  value?: string
}

export const TextView = () => {
  const [props, setProps] = useState<TextInputProps | null>(null)
  const program = useProgram(state => state)

  useEffect(() => {
    program.wx?.on('inserttextarea', (data: TextInputPayload) => {
      setProps({
        style: {
          ...data.style,
          position: 'absolute'
        },
        value: data.value,
        placeholder: data.placeholder,
        placeholderTextColor: data.placeholderStyle.color
      })
    })

    return () => program.wx?.off('inserttextarea')
  }, [])

  const onInput = useCallback((event) => {
    if (props !== null) {
      debugger
    }
  }, [props])

  return props 
    ? <TextInput 
      {...props} 
      style={[ props.style, { borderWidth: 0 } ]} 
      onTextInput={onInput} 
    /> 
    : null
}