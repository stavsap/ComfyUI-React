import React, {useEffect, useState} from 'react';
import {useComfy} from "../comfy/ComfyProvider";
import logo from "../logo.svg";
import {Box, Button, Image, Select, Stack, Text} from "@chakra-ui/react";
import { Spinner } from '@chakra-ui/react'
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
} from '@chakra-ui/react'
import {Subscribe, UnSubscribe, WS_MESSAGE_TYPE_EXECUTED} from "../comfy/api";

const Dashboard = () => {
    const {queuePrompt, fetchCheckpoints } = useComfy();
    const [rand, setRand] = useState<number>(Math.random);
    const [image, setImage] = useState<string | null>(null);

    const [checkpoints, setCheckpoints] = useState<string[][]>([]);
    const [selectedOption, setSelectedOption] = useState<string>("");

    const [cfg, setCfg] = useState(5);
    const [steps, setSteps] = useState(25);

    useEffect(() => {
        updateCheckpoint()
        Subscribe('dashboard',(event) => {
            const message = JSON.parse(event.data);
            console.log(message)
            if(message.type === WS_MESSAGE_TYPE_EXECUTED){
                setRand(prev=>Math.random())
                setImage(prev => message.data.output.images[0].filename)
            }
        })
        return () => {
            UnSubscribe('dashboard')
        }
    }, []);

    function updateCheckpoint(){
        fetchCheckpoints().then(checkpoints=>{
            console.log(checkpoints)
            setCheckpoints(prev=>checkpoints)
        })
    }

    function generate(){
        queuePrompt({
            cfg:cfg,
            steps:steps,
            seed:Math.round(Math.random()*100000),
            checkpoint: selectedOption
        }).then(res=>{
            console.log(res)
        })
    }

    const handleCFGChange = (value: number) => {
        setCfg(prev => value); // Update the state with the new slider value
    };

    const handleStepsChange = (value: number) => {
        setSteps(prev => value); // Update the state with the new slider value
    };

    const handleSelectChange = (event: any) => {
        setSelectedOption(event.target.value);
    };

    return (
        <div >

                <Stack direction="row" spacing={2} style={{ width: '100%' }}>
                    <Box flex="1"  style={{paddingLeft:'20px', paddingRight:'20px'}}>
                        <Stack direction={"column"} spacing={6} style={{marginTop:'5vh'}}>
                            <Select placeholder='Select Checkpoint'
                                    value={selectedOption}
                                    onChange={handleSelectChange} >
                                {checkpoints?.length>0 && checkpoints[0].map((option, index) =>
                                    <option key={index} value={option}>{option}</option>
                                )}
                            </Select>
                            <Text>CFG ({cfg})</Text>
                            <Slider aria-label='slider-ex-1'
                                    defaultValue={cfg}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    onChange={handleCFGChange}>
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>

                            <Text>Steps ({steps})</Text>
                            <Slider aria-label='slider-ex-1'
                                    defaultValue={steps}
                                    min={1}
                                    max={100}
                                    step={1}
                                    onChange={handleStepsChange}
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                            <Button colorScheme='blue' onClick={generate} style={{width:'80%', marginTop:'40px'}}>Generate</Button>
                        </Stack>

                    </Box>
                    <Box flex="2"
                         display="flex"
                         alignItems="center"
                         justifyContent="center"
                         h="100vh"
                         >
                        <Box boxSize="80%" border="2px solid black" p="4" borderRadius="md">
                            {image && (
                                <Image
                                    src={`/view?filename=${image}&type=output&rand=${rand}`}
                                    alt=""
                                    maxW="100%"
                                    maxH="100%"
                                />
                            )}
                        </Box>

                    </Box>
                    <Box flex="1">
                        {/*<Spinner*/}
                        {/*    thickness='4px'*/}
                        {/*    speed='0.65s'*/}
                        {/*    emptyColor='gray.200'*/}
                        {/*    color='blue.500'*/}
                        {/*    size='xl'*/}
                        {/*/>*/}
                    </Box>
                </Stack>
        </div>
    );
};

export default Dashboard;
