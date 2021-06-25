import { useHistory, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { Question } from '../components/Question';

import logoImg from '../assets/images/logo.svg';
import checkImg from '../assets/images/check.svg';
import aswerImg from '../assets/images/answer.svg';
import deleteImg from '../assets/images/delete.svg';

import { useRoom } from '../hooks/useRoom';

import '../styles/room.scss';
import { database } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

type RoomParams = {
  id: string;
}

export function AdminRoom() {
  const { user } = useAuth();
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { title, questions, roomAdmin } = useRoom(roomId);

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}/author`).update({
      endedAt: new Date()
    });

    history.push('/');
  }

  async function handleDeleteQuestion(questionId: string) {
    if ( window.confirm("Tem certeza que deseja excluir esta pergunta?") ) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
    }
  }

  async function handleCkeckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true
    });
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true
    });
  }

  if (user?.id === roomAdmin) {
    return (
      <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId}/>
            <Button onClick={handleEndRoom} isOutlined>Encerrar sala</Button>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="room-title">
          <h1>Sala {title}</h1>
          { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

          <div className="question-list">
            {questions.map(question => {
            return (
              <Question 
                key={question.id}
                content={question.content}
                author={question.author}
                isAnswered={question.isAnswered}
                isHighlighted={question.isHighlighted}
              >
                
                {!question.isAnswered && (
                  <>
                    <button
                      onClick={() => handleCkeckQuestionAsAnswered(question.id)}
                    >
                      <img src={checkImg} alt="Marcar pergunta com respondida" />
                    </button>
                    
                    <button
                      onClick={() => handleHighlightQuestion(question.id)}
                    >
                      <img src={aswerImg} alt="Dar destaque à pergunta" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Remover pergunta" />
                </button>
              </Question>
            )
          })}
        </div>

      </main>
    </div>
    )
  } else {
    return null
  }
}