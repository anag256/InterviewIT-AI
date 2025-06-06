
"use client";

import { interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.actions';
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

enum CallStatus{
    INACTIVE='INACTIVE',
    CONNECTING='CONNECTING',
    ACTIVE='ACTIVE',
    FINISHED='FINISHED',
}
interface SavedMessage{
  role:'user' | 'system' | 'assistant';
  content:string;

}
const Agent = ({userName,userId,type,interviewId,questions,feedbackId}:AgentProps) => {
const router=useRouter();
const [isSpeaking,setIsSpeaking]=useState(false);
const [callStatus,setCallStatus]=useState<CallStatus>(CallStatus.INACTIVE);

const [messages,setMessages]=useState<SavedMessage[]>([])


useEffect(()=>{
  const onCallStart=()=>setCallStatus(CallStatus.ACTIVE);
  const onCallEnd=()=>setCallStatus(CallStatus.FINISHED);
  const onMessage=(message:Message)=>{
    if(message.type === 'transcript' && message.transcriptType==='final'){
      const newMessage={role:message.role,content:message.transcript}
      setMessages((prev)=>[...prev,newMessage])
    }
  }

  const onSpeechStart=()=>setIsSpeaking(true);
  const onSpeechEnd=()=>setIsSpeaking(false);

  const onError=(error:Error)=>console.log('Error',error)

  vapi.on('call-start',onCallStart);
  vapi.on('call-end',onCallEnd);
  vapi.on('speech-start',onSpeechStart);
  vapi.on('speech-end',onSpeechEnd);
  vapi.on('message',onMessage);
  vapi.on('error',onError);
return ()=>{
  vapi.off('call-start',onCallStart);
  vapi.off('call-end',onCallEnd);
  vapi.off('speech-start',onSpeechStart);
  vapi.off('speech-end',onSpeechEnd);
  vapi.off('message',onMessage);
  vapi.off('error',onError);
}
},[])

const handleGenerateFeedback = async (messages: SavedMessage[]) => {
  console.log("handleGenerateFeedback",messages);

  const { success, feedbackId: id } = await createFeedback({
    interviewId: interviewId!,
    userId: userId!,
    transcript: messages,
    feedbackId,
  });

  if (success && id) {
    router.push(`/interview/${interviewId}/feedback`);
  } else {
    console.log("Error saving feedback");
    router.push("/");
  }
};
useEffect(()=>{
  if(callStatus===CallStatus.FINISHED){
    if(type==='generate'){
      router.push("/");
    }
    else{
      handleGenerateFeedback(messages);
    }
  }

},[messages,callStatus,type,userId])

const handleCall=async()=>{
  setCallStatus(CallStatus.CONNECTING);

  if(type==="generate"){
    await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,{
      variableValues:{
        username:userName,
        userid:userId || process.env.DEFAULT_GUEST_ID,
      }
    });

  }
  else{
    let formattedQuestions='';
    if(questions){
      formattedQuestions=questions.map((questn)=>`-${questn}`).join('\n');
      await vapi.start(interviewer,{
        variableValues:{
          questions:formattedQuestions
        }
      })
    }
  }

}

const handleDisconnect=()=>{
  setCallStatus(CallStatus.FINISHED);


}
const lastMessage=messages[messages.length-1]?.content;
const isCallInactiveorFinished=callStatus===CallStatus.INACTIVE ||  CallStatus.FINISHED;
  return (
    <>
<div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {
        messages.length>0 && (
            <div className='transcript-border'>
                <div className='transcript'>
                    <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0','animate-fadeIn opacity-100')}>
                        {lastMessage}
                    </p>
                </div>
            </div>
        )
      }
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {isCallInactiveorFinished && callStatus!=='CONNECTING'
                ? "Call"
                : ". . ."}
                {
                 callStatus==='CONNECTING' && " Connecting..."
                }
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  )
}

export default Agent